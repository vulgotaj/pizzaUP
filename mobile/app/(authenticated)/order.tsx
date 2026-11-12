import { View, Text, ActivityIndicator, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Category, Product, Item, Order as OrderData } from '@/types';
import api from '@/services/api';
import { colors, spacing, fontSize, fonts } from '@/constants/theme';
import { Ionicons } from '@react-native-vector-icons/ionicons'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Select } from '@/components/Select';
import { QuantityControl } from '@/components/QuantityControl';
import { Button } from '@/components/Button';
import { OrderItem } from '@/components/OrderItem';

export default function Order() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { order_id, table } = useLocalSearchParams<{
    order_id: string;
    table: string;
  }>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [catalog, setCatalog] = useState<{ categoryId: string; products: Product[] }>({ categoryId: "", products: [] });
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const products = catalog.categoryId === selectedCategory ? catalog.products : [];
  const loadingProducts = !!selectedCategory && catalog.categoryId !== selectedCategory;
  const [loadingAddItem, setLoadingAddItem] = useState(false);
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [categoryResponse, orderResponse] = await Promise.all([
          api.get<Category[]>("/category"),
          api.get<OrderData>("/order/detail", { params: { order_id } }),
        ]);
        if (active) {
          setCategories(categoryResponse.data);
          setItems(orderResponse.data.items ?? []);
        }
      } catch {
        if (active) Alert.alert("Atenção", "Não foi possível carregar o pedido.");
      } finally { if (active) setLoadingCategories(false); }
    }
    void load();
    return () => { active = false; };
  }, [order_id]);

  useEffect(() => {
    if (!selectedCategory) return;
    let active = true;
    async function load() {
      try {
        const { data } = await api.get<Product[]>("/category/product", { params: { category_id: selectedCategory } });
        if (active) setCatalog({ categoryId: selectedCategory, products: data });
      } catch {
        if (active) {
          setCatalog({ categoryId: selectedCategory, products: [] });
          Alert.alert("Atenção", "Não foi possível carregar os produtos.");
        }
      }
    }
    void load();
    return () => { active = false; };
  }, [selectedCategory]);

  async function handleAddItem(){
    if (loadingAddItem || !products.some(product => product.id === selectedProduct)) return;
    try{
      setLoadingAddItem(true)

      const response = await api.post<Item>("/order/add", {
        order_id: order_id,
        product_id: selectedProduct,
        amount: quantity
      })

      setItems(current => [...current, response.data]);

      setSelectedCategory("")
      setSelectedProduct("")
      setQuantity(1)
    }catch(error){
      console.log(error)
    }finally{
      setLoadingAddItem(false);
    }
  }

  async function handleRemoveItem(item_id: string){
    try{
      await api.delete("/order/remove", {
        params: {
          item_id: item_id
        }
      });

      const updatedItems = items.filter(item => item.id !== item_id)
      setItems(updatedItems);
      Alert.alert("Item removido", "Seu item foi removido da mesa!")
    }catch(error){
      console.log(error);
      Alert.alert("Atenção!", "Erro ao remover item")
    }
  }

  async function handleAdvance(){
    if(items.length === 0){
      return
    }

    router.push({
      pathname: "/(authenticated)/finish",
      params: { order_id: order_id, table: table }
    })
  }

  if(loadingCategories){
    return(
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand}/>
      </View>
    )
  }

  return (
    <View style={styles.container}>

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Mesa {table}</Text>

          <Pressable 
            style={styles.closeButton}
            onPress={() => router.back()}  
          >
            <Ionicons name="arrow-back" size={20} color={colors.red}/>
          </Pressable>
        </View>
      </View>


      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        <Select 
          label="Categorias"
          placeholder="Selecione a categoria..."
          options={categories.map( category => ({
            label: category.name,
            value: category.id
          }))}
          selectedValue={selectedCategory}
          onValueChange={value => { setSelectedCategory(value); setSelectedProduct(""); }}

        />

        {loadingProducts ? (
          <ActivityIndicator size="small" color={colors.brand} />
        ) : (
          !!selectedCategory && <Select
            placeholder="Selecione um produto..." 
            options={products.map( product => ({
              label: product.name,
              value: product.id,
            })  )}
            selectedValue={selectedProduct}
            onValueChange={setSelectedProduct}
          />
        )}

        {!!selectedProduct && (
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantidade:</Text>
            <QuantityControl 
              quantity={quantity} 
              onIncrement={ () => setQuantity((quantity) => Math.min(999, quantity + 1)) }
              onDecrement={ () => {
                if(quantity <= 1){
                  setQuantity(1)
                  return;
                }

                setQuantity((quantity) => quantity - 1)
              }}
            />
          </View>
        )}

        {!!selectedProduct && (
          <Button
            title="Adicionar"
            onPress={handleAddItem}
            variant="secondary"
            loading={loadingAddItem}
          />
        )}

        {items.length > 0 && (
          <View style={styles.itemsSection}>
            <Text style={styles.itemsTitle}>Itens adicionados</Text>
            {items.map((item) => (
              <OrderItem
                item={item}
                key={item.id}
                onRemove={handleRemoveItem}
              />
            ))}
          </View>
        )}


        {items.length > 0 && (
          <View style={styles.footer}>
            <Button title="Avançar" onPress={handleAdvance} />
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  headerTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xxl,
    color: colors.brand,
  },
  closeButton: {
    backgroundColor: colors.dangerBackground,
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.sm,
    borderRadius: 8
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  quantitySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  quantityLabel: {
    fontFamily: fonts.bold,
    color: colors.primary,
    fontSize: fontSize.lg,
  },
  itemsSection: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  itemsTitle: {
    fontFamily: fonts.heading,
    color: colors.primary,
    fontSize: fontSize.lg,
  },
  footer: {
    paddingTop: 24,
  }
})
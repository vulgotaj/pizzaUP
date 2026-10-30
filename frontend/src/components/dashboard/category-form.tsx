"use client"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { createCategoryAction } from '@/actions/categories'
import { useRouter } from 'next/navigation'

export function CategoryForm(){
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleCreateCategory(e: React.SubmitEvent<HTMLFormElement>){
    e.preventDefault();

    const formData = new FormData(e.currentTarget)
    const result = await createCategoryAction(formData);

    if(result.success){
      setOpen(false);   
      router.refresh();
      return;
    }else{
      console.log(result.error)
    }
  }

  return(
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-brand-primary hover:bg-brand-primary font-semibold" />
        }
      >
        <Plus className='h-5 w-5 mr-2' />
        Nova categoria
      </DialogTrigger>

      <DialogContent className="p-6 bg-app-card text-foreground">
        <DialogHeader>
          <DialogTitle>
            Criar nova categoria
          </DialogTitle>
          <DialogDescription>
            Criando nova categoria...
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleCreateCategory}>
          <div>
            <Label htmlFor="category" className="mb-2">
              Nome da categoria
            </Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Digite o nome da categoria..."
              className="border-app-border bg-app-background text-foreground"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary"
          >
            Criar categoria
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

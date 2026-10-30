"use client"

import { useActionState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Label } from '../ui/label'
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import Link from 'next/link'
import { loginAction } from '@/actions/auth';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const router = useRouter();

  useEffect(() => {
    if(state?.success && state?.redirectTo){
      router.replace(state.redirectTo);
    }
  }, [state, router])

  return(
    <Card className="bg-app-card border border-app-border w-full max-w-md mx-auto"> 
      <CardHeader>
        <CardTitle className="text-foreground text-center text-3xl sm:text-4xl font-bold">
          pizza<span className="text-brand-highlight">UP</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" action={formAction}>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input type="email" id="email" name="email" placeholder="Digite seu email" required className="text-foreground bg-app-card border border-app-border"/>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Senha</Label>
            <Input type="password" id="password" name="password" placeholder="Digite sua senha" required minLength={3} className="text-foreground bg-app-card border border-app-border"/>
          </div>

          <Button type="submit" className="w-full bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary">
            { isPending ? "Acessando conta..." : "Entrar"}
          </Button>

          {state?.error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {state.error}
            </div>
          )}

          <p className="text-center text-sm text-foreground">
            Ainda não possui uma conta? <Link href="/register" className="text-brand-highlight font-semibold">Crie uma conta</Link>
          </p>

        </form>
      </CardContent>
    </Card>
  )
}
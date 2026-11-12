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
import { registerAction } from '@/actions/auth';
import { useRouter } from 'next/navigation';

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, null);
  const router = useRouter();

  useEffect(() => {
    if(state?.success && state?.redirectTo){
      router.replace(state.redirectTo);
    }
  }, [state, router])

  return(
    <Card className="bg-app-card border border-app-border py-8 w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="wordmark text-center text-4xl sm:text-5xl">
          pizza<span className="text-brand-highlight">UP</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" action={formAction}>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Nome</Label>
            <Input type="text" id="name" name="name" placeholder="Digite seu nome" required minLength={3} className="text-foreground bg-app-input border border-app-control-border"/>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input type="email" id="email" name="email" placeholder="Digite seu email" required className="text-foreground bg-app-input border border-app-control-border"/>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Senha</Label>
            <Input type="password" id="password" name="password" placeholder="Pelo menos 12 caracteres" required minLength={12} maxLength={72} autoComplete="new-password" className="text-foreground bg-app-input border border-app-control-border"/>
          </div>

          <Button type="submit" disabled={isPending} className="w-full bg-brand-primary text-brand-primary-foreground hover:bg-brand-hover active:bg-brand-pressed">
            { isPending ? "Criando acesso..." : "Cadastrar atendente"}
          </Button>

          {state?.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
          <p className="text-center text-sm text-foreground">
            <Link href="/dashboard" className="text-brand-highlight font-semibold">Voltar ao dashboard</Link>
          </p>

        </form>
      </CardContent>
    </Card>
  )
}
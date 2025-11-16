# Configuração do Stripe

A integração com o Stripe foi implementada com sucesso. Siga as etapas abaixo para ativar a funcionalidade de pagamento.

## Passos Necessários

### 1. Criar uma Conta Stripe

1. Acesse [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Crie sua conta e complete o setup inicial
3. Verifique seu email

### 2. Obter as Chaves da API

1. No Dashboard do Stripe, vá para **Developers** → **API Keys**
2. Você verá duas chaves:
   - **Secret Key** (começa com `sk_live_` ou `sk_test_`)
   - **Publishable Key** (começa com `pk_live_` ou `pk_test_`)

Para testes, use as chaves com `test` no nome.

### 3. Configurar as Variáveis de Ambiente no Supabase

1. Acesse o painel do Supabase do projeto
2. Vá para **Settings** → **Environment Variables**
3. Adicione as seguintes variáveis:
   - `STRIPE_SECRET_KEY`: Sua Secret Key do Stripe
   - `STRIPE_WEBHOOK_SECRET`: Você obterá isso na próxima etapa

### 4. Configurar o Webhook do Stripe

1. No Dashboard do Stripe, vá para **Developers** → **Webhooks**
2. Clique em **Add Endpoint**
3. Configure com a URL:
   ```
   https://[seu-supabase-url]/functions/v1/stripe-webhook
   ```
4. Selecione os eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Clique em **Add endpoint**
6. Na página do webhook, clique em **Reveal** para ver o `Signing Secret`
7. Copie este valor e configure em Supabase como `STRIPE_WEBHOOK_SECRET`

## Fluxo de Funcionamento

1. **Usuário clica em "Fazer Upgrade"**
   - Isso pode ser em:
     - Modal de upgrade (ao atingir limite)
     - Página de Plano (AccountPlanScreen)

2. **Checkout Session é criada**
   - Edge Function `create-checkout-session` é chamada
   - Cria uma sessão de checkout no Stripe
   - Redireciona o usuário para a página de checkout do Stripe

3. **Pagamento é processado**
   - Usuário completa o pagamento no Stripe
   - Stripe redireciona para a página inicial do app

4. **Webhook processa o sucesso**
   - Edge Function `stripe-webhook` recebe o evento
   - Atualiza o status `is_premium = true` no banco de dados
   - Ativa o acesso aos recursos premium

## Testando Localmente

Para testar o webhook em desenvolvimento:

1. Instale o Stripe CLI: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

2. Faça login:
   ```bash
   stripe login
   ```

3. Escute os eventos:
   ```bash
   stripe listen --forward-to localhost:3000/functions/v1/stripe-webhook
   ```

4. Use cartões de teste fornecidos pelo Stripe:
   - Sucesso: `4242 4242 4242 4242`
   - Falha: `4000 0000 0000 0002`
   - Data: Qualquer data futura
   - CVC: Qualquer número de 3 dígitos

## Modelos de Preço

O preço padrão configurado é:

- **Valor**: R$ 29,90/mês
- **Moeda**: BRL (Real Brasileiro)
- **Ciclo**: Mensal
- **Tipo**: Assinatura recorrente

Para alterar o preço, edite a Edge Function `create-checkout-session`:

```typescript
unit_amount: 2990, // em centavos
```

## Recursos Premium Ativados

Quando um usuário faz upgrade para Premium:

1. **Produtos Ilimitados** - Sem limite de 50 produtos
2. **Vendas Ilimitadas** - Sem limite de 30 vendas/mês
3. **Acesso a Todos os Recursos** - Sem restrições

## Troubleshooting

### "Erro ao criar sessão de checkout"
- Verifique se `STRIPE_SECRET_KEY` está configurado corretamente
- Confirme que a Edge Function foi deployada com sucesso

### "Webhook não processa"
- Verifique se `STRIPE_WEBHOOK_SECRET` está configurado
- Confirme que a URL do webhook está correta
- Verifique os logs da Edge Function no Supabase

### Pagamento concluído mas status não atualiza
- Aguarde alguns segundos para o webhook processar
- Atualize a página
- Verifique os logs do Supabase

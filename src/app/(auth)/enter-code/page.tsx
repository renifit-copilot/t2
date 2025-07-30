import ClientFormWrapper from '@/components/auth/ClientFormWrapper';

export default function EnterCodePage() {
  // До этой точки дойдёт только не-авторизованный юзер:
  // middleware уже проверил cookies / initData и,
  // если надо, сразу редиректнул на нужный дашборд.
  return <ClientFormWrapper />;
}
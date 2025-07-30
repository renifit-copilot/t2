// app/api/logout/route.ts

import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set('role', '', { path: '/', maxAge: 0 });
  response.cookies.set('tgId', '', { path: '/', maxAge: 0 });
  response.cookies.set('groupCode', '', { path: '/', maxAge: 0 });
  response.cookies.set('tempInitData', '', { path: '/', maxAge: 0 });

  return response;
}

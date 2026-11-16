import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { authConfigured } from '@/lib/supabase/config';
export async function GET(request:NextRequest){
 const destination=new URL('/compte',request.url);
 if(!authConfigured())return NextResponse.redirect(new URL('/connexion',request.url));
 const code=request.nextUrl.searchParams.get('code');
 if(!code)return NextResponse.redirect(new URL('/connexion?erreur=confirmation',request.url));
 const response=NextResponse.redirect(destination);
 const client=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{cookies:{getAll(){return request.cookies.getAll()},setAll(items){items.forEach(({name,value,options})=>response.cookies.set(name,value,options))}}});
 const {error}=await client.auth.exchangeCodeForSession(code);
 return error?NextResponse.redirect(new URL('/connexion?erreur=confirmation',request.url)):response;
}

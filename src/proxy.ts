import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { authConfigured } from '@/lib/supabase/config';
export async function proxy(request:NextRequest){
 if(!authConfigured())return NextResponse.next({request});
 let response=NextResponse.next({request});
 const client=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{cookies:{getAll(){return request.cookies.getAll()},setAll(items){items.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});items.forEach(({name,value,options})=>response.cookies.set(name,value,options))}}});
 await client.auth.getClaims();
 return response;
}
export const config={matcher:['/compte/:path*','/connexion','/inscription']};

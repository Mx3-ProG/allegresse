import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authConfigured } from '@/lib/supabase/config';
const credentials=z.object({email:z.email().max(254),password:z.string().min(8).max(128)});
const signUpSchema=credentials.extend({acceptTerms:z.literal(true)});
export async function POST(request:NextRequest,{params}:{params:Promise<{action:string}>}){
 const {action}=await params;
 if(!['inscription','connexion','deconnexion'].includes(action))return NextResponse.json({error:'Action inconnue'},{status:404});
 if(!authConfigured())return NextResponse.json({error:'Le service de comptes est en cours de configuration.'},{status:503});
 if(request.headers.get('origin')!==request.nextUrl.origin)return NextResponse.json({error:'Origine non autorisée'},{status:403});
 let response=NextResponse.json({ok:true});
 const client=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{cookies:{getAll(){return request.cookies.getAll()},setAll(items){items.forEach(({name,value,options})=>response.cookies.set(name,value,options))}}});
 if(action==='deconnexion'){const {error}=await client.auth.signOut();return error?NextResponse.json({error:'Déconnexion impossible'},{status:500}):response;}
 let body:unknown;try{body=await request.json()}catch{return NextResponse.json({error:'Données invalides'},{status:400})}
 const parsed=(action==='inscription'?signUpSchema:credentials).safeParse(body);
 if(!parsed.success)return NextResponse.json({error:'Vérifiez votre adresse, votre mot de passe (8 caractères minimum) et votre accord aux conditions.'},{status:400});
 const {email,password}=parsed.data;
 if(action==='inscription'){
  const {data,error}=await client.auth.signUp({email,password,options:{emailRedirectTo:`${request.nextUrl.origin}/auth/callback`}});
  if(error)return NextResponse.json({error:error.message},{status:400});
  const previous=response;response=NextResponse.json({ok:true,confirmationRequired:!data.session});previous.cookies.getAll().forEach(cookie=>response.cookies.set(cookie));
 }else{
  const {error}=await client.auth.signInWithPassword({email,password});
  if(error)return NextResponse.json({error:'Adresse ou mot de passe incorrect.'},{status:401});
 }
 return response;
}

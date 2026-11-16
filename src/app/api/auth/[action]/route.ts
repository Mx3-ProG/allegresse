import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authConfigured } from '@/core/db/config';
import { isCompromisedPassword, passwordPolicyError } from '@/core/auth/password-policy';
import { usernameError, normalizeUsername } from '@/modules/account/profile/validation';
const credentials=z.object({email:z.email().max(254),password:z.string().min(8).max(128),next:z.enum(['/compte','/compte/abonnement']).optional()});
const signUpSchema=credentials.extend({confirmPassword:z.string(),username:z.string().min(3).max(24),acceptTerms:z.literal(true)});
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
 if(!parsed.success)return NextResponse.json({error:'Vérifiez les informations saisies et votre accord aux conditions.'},{status:400});
 const {email,password}=parsed.data;
 if(action==='inscription'){
  const signup=parsed.data as z.infer<typeof signUpSchema>;
  const policyError=passwordPolicyError(password);
  if(policyError)return NextResponse.json({error:policyError},{status:400});
  if(password!==signup.confirmPassword)return NextResponse.json({error:'Les deux mots de passe ne correspondent pas.'},{status:400});
  const username=normalizeUsername(signup.username);
  const usernameValidationError=usernameError(username);
  if(usernameValidationError)return NextResponse.json({error:usernameValidationError},{status:400});
  try{if(await isCompromisedPassword(password))return NextResponse.json({error:'Ce mot de passe figure dans une liste de mots de passe compromis. Choisissez-en un autre.'},{status:400});}
  catch{return NextResponse.json({error:'La vérification de sécurité du mot de passe est temporairement indisponible. Réessayez plus tard.'},{status:503});}
  const next=signup.next==='/compte/abonnement'?'?next=%2Fcompte%2Fabonnement':'';
  const {data,error}=await client.auth.signUp({email,password,options:{emailRedirectTo:`${request.nextUrl.origin}/auth/callback${next}`,data:{username}}});
  if(error)return NextResponse.json({error:error.message},{status:400});
  const previous=response;response=NextResponse.json({ok:true,confirmationRequired:!data.session});previous.cookies.getAll().forEach(cookie=>response.cookies.set(cookie));
 }else{
  const {error}=await client.auth.signInWithPassword({email,password});
  if(error)return NextResponse.json({error:'Adresse ou mot de passe incorrect.'},{status:401});
 }
 return response;
}

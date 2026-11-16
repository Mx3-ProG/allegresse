import QRCode from 'qrcode';
import { getVerse } from '@/features/bible/data';
export async function GET(request:Request,{params}:{params:Promise<{reference:string}>}){
 const {reference}=await params;
 const match=reference.match(/^(matthieu|marc|luc|jean)-(\d{1,2})-(\d{1,2})$/);
 if(!match||!getVerse(match[1],Number(match[2]),Number(match[3])))return new Response('Verset introuvable',{status:404});
 const origin=new URL(request.url).origin;
 const svg=await QRCode.toString(`${origin}/versets/${reference}`,{type:'svg',margin:2,width:240,color:{dark:'#17283d',light:'#faf8f3'}});
 return new Response(svg,{headers:{'Content-Type':'image/svg+xml; charset=utf-8','Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff'}});
}

import { notFound, redirect } from 'next/navigation';
import { getBook, chapterUrl } from '@/features/bible/data';
export default async function BookPage({params}:{params:Promise<{book:string}>}){const {book}=await params;if(!getBook(book))notFound();redirect(chapterUrl(book,1));}

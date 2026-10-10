import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

/** Font variables and base text classes for every root `<html>` (site and preview layouts). */
export const htmlFontClassName = `${geistSans.variable} ${geistMono.variable} font-sans antialiased`;

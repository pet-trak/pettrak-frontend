import type { Metadata } from "next";
import './globals.css'


export const metadata: Metadata = {
  title: "PetArk",
  description:
    "PetArk is a digital health platform that connects pet owners with vet clinics"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Manrope Google Fonts link */}
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope&display=swap"
          rel="stylesheet"
        />
        
        {/* Google Sans */}
        <link href="https://fonts.cdnfonts.com/css/google-sans"
          rel="stylesheet"
        />

      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

import Background from "@/components/background/Background";

export default function RainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Background />
      {children}
    </>
  );
}

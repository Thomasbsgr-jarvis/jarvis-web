import Header from "@/components/Header"
import Vocal from "./components/Vocal"

export default function Home() {
  return (
    <>
      <Header />
      <div className="relative h-screen w-screen overflow-hidden bg-background cursor-default select-none">
        <div className="flex h-full items-center justify-center flex-col gap-6 px-12">
          <div className="w-full max-w-3xl text-center flex flex-col gap-4">
            <h1 className="text-4xl sm:text-5xl font-semibold"><span className="font-sans">B</span>onjour, Thomas</h1>
            <p className="mt-4 text-balance text-lg text-foreground-muted sm:text-xl">
              Que puis-je faire pour vous ?
            </p>
          </div>
          <Vocal />
        </div>
      </div>
    </>
  )
}

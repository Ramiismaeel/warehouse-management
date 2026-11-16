import { Button } from "@/components/ui/button"
import { Package } from "lucide-react"

export default function App() {
    return (
        <div className="flex min-h-svh items-center justify-center">
            <Button><Package /> Lager öffnen</Button>
        </div>
    )
}
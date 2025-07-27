import { Send } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-gray-800/90">
            <div className="text-white p-8 md:p-16 md:pt-8">
                <p className="font-light text-md mb-2">
                    Berlangganan email newsletter kami
                </p>
                <form className="flex items-center max-w-sm">
                    <input
                        type="email"
                        placeholder="Email"
                        className="border border-black/50 rounded-l-md px-3 py-2 text-white bg-black/50 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                        aria-label="Email for newsletter"
                    />
                    <button type="submit" className="rounded-r-md bg-green-700/80 px-3 py-2 border border-green-700/80">
                        <Send className="w-5 h-5 text-white" />
                    </button>
                </form>
            </div>
        </footer>
    )
}
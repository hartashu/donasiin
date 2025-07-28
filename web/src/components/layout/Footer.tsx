import { Send } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-black/70 backdrop-blur-lg border-t border-white/10 "
        >
            <div className="container mx-auto text-white p-8 md:p-12 text-center md:text-left">
                <div className="md:flex md:justify-between md:items-center">
                    <div>
                        <h3 className="text-2xl font-bold mb-1">Donasiin</h3>
                        <p className="text-gray-300 mb-6 md:mb-0">Berbagi kebaikan, ciptakan perubahan.</p>
                    </div>
                    <div className="max-w-sm mx-auto md:mx-0">
                        <p className="font-light text-md mb-2 text-gray-300">
                            Berlangganan untuk info terbaru
                        </p>
                        <form className="flex items-center">
                            <input
                                type="email"
                                placeholder="Email anda..."
                                className="border border-white/20 rounded-l-md px-3 py-2 text-white bg-white/10 w-full focus:outline-none focus:ring-2 focus:ring-[#2a9d8f] placeholder:text-gray-400"
                                aria-label="Email for newsletter"
                            />
                            <button type="submit" className="rounded-r-md bg-[#2a9d8f] px-3 py-2 border border-[#2a9d8f] hover:bg-[#268a7e] transition-colors">
                                <Send className="w-5 h-5 text-white" />
                            </button>
                        </form>
                    </div>
                </div>
                <div className="border-t border-white/10 mt-8 pt-6 text-center text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Donasiin. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    )
}

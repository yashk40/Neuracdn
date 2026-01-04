import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function TermsPage() {
    return (
      <div className="min-h-screen bg-black text-white font-poppins pt-20 " style={{alignItems: "center", justifyContent: "center", textAlign: "center"}}>
            <Navbar />
            <main className="container mx-auto px-4 py-24 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
                <div className="prose prose-zinc max-w-none">
                    <p className="text-lg text-zinc-600 mb-8">Last updated: January 2026</p>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                        <p className="mb-4">
                            By accessing or using Neura CDN's services, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, then you may not access the service.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
                        <p className="mb-4">
                            Neura CDN provides AI-generated UI components and content delivery network services. You understand and agree that the Service is provided "AS-IS" and that Neura CDN assumes no responsibility for the timeliness, deletion, mis-delivery or failure to store any user communications or personalization settings.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold mb-4">3. User Account</h2>
                        <p className="mb-4">
                            To use certain features of the service, you must register for an account. You agree to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mb-4">
                            Provide accurate, current and complete information during the registration process.
                            Maintain the security of your password and identification.
                            Accept all responsibility for any and all activities that occur under your account.
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold mb-4">4. Intellectual Property</h2>
                        <p className="mb-4">
                            The AI-generated code and components you create using Neura CDN are yours to use in your projects. However, the underlying platform, algorithms, and service infrastructure remain the property of Neura CDN.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold mb-4">5. Termination</h2>
                        <p>
                            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold mb-4">6. Contact Us</h2>
                        <p>
                            If you have any questions about these Terms, please contact us at: <a href="mailto:legal@neuracdn.com" className="text-blue-600 hover:underline">ykumawat006@gmail.com</a>.
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}

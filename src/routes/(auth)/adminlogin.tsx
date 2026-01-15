import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getLastUsedLoginMethod } from '@/lib/auth-client';
import { SignInProvider } from '@/lib/signin';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/adminlogin')({
  component: RouteComponent,
})

function RouteComponent() {
  const callbackUrl = '/admin';
  const lastMethod = getLastUsedLoginMethod();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] relative">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center  w-full">
        <div className="hidden md:block w-full bg-ucr-blue min-h-screen relative z-0 overflow-hidden">
          
        </div>
        <div className="flex flex-col items-center justify-center max-w-md mx-auto m-4">
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Admin Login</h2>
          <p className='mb-6'>Login to access the admin panel.
            If you are not an admin, please return to the <a href="/" className="text-ucr-blue hover:underline">home page</a>.
          </p>
          <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      const fullCallbackUrl = `${window.location.origin}${callbackUrl}`;
                      await SignInProvider("google", fullCallbackUrl);
                    }}
                    className="w-auto justify-center gap-2 border-[#b1b6bc] cursor-pointer bg-white hover:bg-[#F5F7FB] relative"
                  >
                    <img
                      src="https://www.svgrepo.com/show/475656/google-color.svg"
                      alt="Google"
                      width={18}
                      height={18}
                    />
                    <span>Google</span>
                    {lastMethod === "google" && (
                      <Badge
                        variant={"outline"}
                        className="ml-2 translate-1/2 absolute right-0 -top-2/3 bg-ucr-blue text-white border-ucr-blue"
                      >
                        Last
                      </Badge>
                    )}
                  </Button>
        </div>
      </div>
    </div>
  )
}

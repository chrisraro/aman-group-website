import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginAction } from "@/app/actions/auth"

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access the admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" type="text" required placeholder="Enter username" defaultValue="" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Enter password"
                defaultValue=""
              />
            </div>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600">
            <p className="mb-2">Demo credentials:</p>
            <div className="bg-gray-100 p-3 rounded-md text-left">
              <p className="font-mono text-xs">
                <strong>Username:</strong> admin
              </p>
              <p className="font-mono text-xs">
                <strong>Password:</strong> admin123
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

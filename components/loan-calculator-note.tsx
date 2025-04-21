import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export function LoanCalculatorNote() {
  return (
    <Card className="bg-muted/50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-medium">Important Notes</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
              <li>This calculator provides estimates only and actual loan terms may vary.</li>
              <li>
                Additional charges such as reservation fees, processing fees, and documentary stamp taxes are not
                included in these calculations.
              </li>
              <li>
                The standard reservation fee is ₱25,000.00 and is non-refundable but deductible from the total contract
                price.
              </li>
              <li>Interest rates are subject to change without prior notice.</li>
              <li>Please consult with our sales representatives for the most current rates and terms.</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

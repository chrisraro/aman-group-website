import type React from "react"

interface ModelHouseDetailsProps {
  modelHouse: any // Replace 'any' with a more specific type if available
  unit: any // Replace 'any' with a more specific type if available
}

const LoanCalculatorButton = ({ price, modelName, propertyType, lotPrice, houseConstructionCost }: any) => {
  // Placeholder for LoanCalculatorButton component
  return (
    <button>
      Calculate Loan for {modelName} (Price: {price}, Lot Price: {lotPrice}, Construction Cost: {houseConstructionCost})
    </button>
  )
}

const ModelHouseDetails: React.FC<ModelHouseDetailsProps> = ({ modelHouse, unit }) => {
  return (
    <div>
      <h2>
        {modelHouse.name} - {unit.name}
      </h2>
      <p>Description: {modelHouse.description}</p>
      <p>Unit Price: {unit.price}</p>
      <p>Lot Price: {unit.lotPrice}</p>
      <p>House Construction Cost: {unit.houseConstructionCost}</p>

      <LoanCalculatorButton
        price={unit.price}
        modelName={`${modelHouse.name} - ${unit.name}`}
        propertyType="model-house"
        lotPrice={unit.lotPrice}
        houseConstructionCost={unit.houseConstructionCost}
      />
    </div>
  )
}

export default ModelHouseDetails

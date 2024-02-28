export interface EntityProperty {
    entityName: string
    propertyType: string
    configValues: (string | number)[]
  }
  
  export const entityProperties: EntityProperty[] = [
    {
      entityName: "cow",
      propertyType: "emits",
      configValues: ["milk", "everyTwoMinutes"],
    },
    {
      entityName: "cow",
      propertyType: "moves",
      configValues: ["movesAround"],
    },
    {
      entityName: "fire",
      propertyType: "emits",
      configValues: ["smoke", "everyFiveSeconds"],
    },
    {
      entityName: "smoke",
      propertyType: "disappears",
      configValues: [5000],
    },
    {
      entityName: "smoke",
      propertyType: "moves",
      configValues: ["sShape"],
    },
    {
      entityName: "farmer",
      propertyType: "moves",
      configValues: ["harvestPattern"],
    },
    {
      entityName: "farmer",
      propertyType: "emits",
      configValues: ["seed", "everyFiveSeconds"],
    },
  ]
export class Product {
  constructor(id, name, price, category, expirationDays, dateOfCreation, daysLeft, isExpired) {
    this.id = id
    this.name = name
    this.price = price
    this.category = category
    this.expirationDays = expirationDays
    this.dateOfCreation = dateOfCreation
    this.daysLeft = daysLeft
    this.isExpired = isExpired
  }
}
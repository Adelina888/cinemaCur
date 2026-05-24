export class Product {
  constructor(id, name, price, category, expirationDays, dateOfCreation, daysLeft, isExpired, status) {
    this.id = id
    this.name = name
    this.price = price
    this.category = category
    this.expirationDays = expirationDays      // срок годности в днях
    this.dateOfCreation = dateOfCreation      // дата производства
    this.daysLeft = daysLeft                  // сколько дней осталось
    this.isExpired = isExpired                // просрочен или нет
    this.status = status                      // 1 - активен, 0 - неактивен
  }
}
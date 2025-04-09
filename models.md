User
- clerkId
- name
- avatar
- email
- phone
- addresses: [Address]
- orders: [Order]
- cart: Cart
- wishlist: Wishlist
- createdAt
- notifications: [Notification]
- referralCode
- referredUsers: [User]
- referralDiscountBalance: Number  

Product
- slug
- title
- subTitle
- description
- price
- images: [{ imageUrl, imageId }]
- category: {
  type: String,
  genre: String
}
- size: [{
  size: String,
  stock: Number
}]
- colors: [String]
- offerStatus
- discount
- offerStartDate
- offerEndDate
- isFeatured
- totalSold
- totalRating
- totalSumOfRating
- reviews: [Review]
- collections: [Collection]
- createdAt
- updatedAt

Collection
- name
- slug
- products: [Product]
- images: [{ imageUrl, imageId }]
- description
- isFeatured
- featuredOrder
- createdAt

HomeContent
- bannerImageUrl
- bannerImageId
- categories: [{
  type: String,
  values: [String]
}]
- allCollections: [String]

Cart
- user: User
- products: [{
  product: Product,
  quantity: Number,
  size: String,
  color: String
}]
- totalAmount
- totalItems
- totalDiscount
- couponApplied: CouponCode 
- updatedAt

Wishlist
- user: User
- products: [Product]
- createdAt
- updatedAt

Order
- user: User
- trackId
- shippingAddress: Address
- products: [{
  productId: Product,
  quantity: Number,
  title: String,
  category: {
    type: String,
    genre: String
  },
  price: Number,
  size: String,
  color: String,
  offerStatus: Boolean,
  discount: Number
}]
- totalOriginalAmount
- payableAmount
- discountAmount
- subtotal
- orderStatus
- paymentStatus
- paymentMethod
- orderDate
- paymentDate
- deliveryDate
- trackingInfo
- couponApplied: CouponCode
- referralDiscountApplied: Number 

CouponCode
- code
- discount
- startDate
- endDate
- isActive
- usageLimit
- usedCount
- minimumPurchase

ReferralProgram  

- discountAmount  
- referrerReward  
- refereeReward   
- minimumPurchaseForRedeem  

Review
- user: User
- product: Product
- rating: Number
- title: String
- comment: String
- isFeatured: Boolean
- createdAt

Address
- user: User
- name: String
- phone: String
- street: String
- city: String
- state: String
- country: String
- zipCode: String
- isDefault: Boolean

Notification
- user: User
- message: String
- type: String  // order, discount, referral
- isRead: Boolean
- createdAt
- relatedTo: {
  model: String,
  id: ObjectId
}
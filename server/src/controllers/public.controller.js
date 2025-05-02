import { HomeContent } from "../models/homecontent.model.js";
import mongoose from "mongoose";

export const getHomeContentDetails = async (req, res) => {
   try {
      // Use aggregation pipeline for efficient data retrieval and transformation
      const aggregationPipeline = [
         // Match first document (or all if you need multiple)
         { $limit: 1 },

         // Process exclusiveProducts with optimization
         {
            $lookup: {
               from: "products",
               localField: "exclusiveProducts.productId",
               foreignField: "_id",
               as: "exclusiveProductsDetails"
            }
         },

         // Lookup offers for the exclusive products
         {
            $lookup: {
               from: "offers",
               localField: "exclusiveProductsDetails.offer",
               foreignField: "_id",
               as: "exclusiveProductsOffers"
            }
         },

         // Lookup collections for the exclusive products
         {
            $lookup: {
               from: "collections",
               localField: "exclusiveProductsDetails.collections",
               foreignField: "_id",
               as: "exclusiveProductsCollections"
            }
         },

         // Process other fields using standard lookups
         {
            $lookup: {
               from: "products",
               localField: "newArrivals.productId",
               foreignField: "_id",
               as: "newArrivalsDetails"
            }
         },
         {
            $lookup: {
               from: "offers",
               localField: "newArrivalsDetails.offer",
               foreignField: "_id",
               as: "newArrivalsOffers"
            }
         },
         {
            $lookup: {
               from: "offers",
               localField: "offerFeatured.offer",
               foreignField: "_id",
               as: "offerFeaturedDetails"
            }
         },
         {
            $lookup: {
               from: "products",
               localField: "alltimeBestSellers",
               foreignField: "_id",
               as: "alltimeBestSellersDetails"
            }
         },
         {
            $lookup: {
               from: "products",
               localField: "womenFeatured.productId",
               foreignField: "_id",
               as: "womenFeaturedDetails"
            }
         },
         {
            $lookup: {
               from: "offers",
               localField: "womenFeaturedDetails.offer",
               foreignField: "_id",
               as: "womenFeaturedOffers"
            }
         },

         // Transform and restructure the data
         {
            $project: {
               heroBannerImages: 1,
               collections: 1,

               // Transform exclusiveProducts to include only what's needed
               exclusiveProducts: {
                  $map: {
                     input: "$exclusiveProducts",
                     as: "exclusiveItem",
                     in: {
                        $mergeObjects: [
                           "$$exclusiveItem",
                           {
                              productId: {
                                 $let: {
                                    vars: {
                                       prod: {
                                          $arrayElemAt: [
                                             {
                                                $filter: {
                                                   input: "$exclusiveProductsDetails",
                                                   as: "p",
                                                   cond: { $eq: ["$$p._id", "$$exclusiveItem.productId"] }
                                                }
                                             },
                                             0
                                          ]
                                       },
                                       productOffer: {
                                          $arrayElemAt: [
                                             {
                                                $filter: {
                                                   input: "$exclusiveProductsOffers",
                                                   as: "o",
                                                   cond: {
                                                      $let: {
                                                         vars: {
                                                            product: {
                                                               $arrayElemAt: [
                                                                  {
                                                                     $filter: {
                                                                        input: "$exclusiveProductsDetails",
                                                                        as: "p",
                                                                        cond: { $eq: ["$$p._id", "$$exclusiveItem.productId"] }
                                                                     }
                                                                  },
                                                                  0
                                                               ]
                                                            }
                                                         },
                                                         in: { $eq: ["$$o._id", "$$product.offer"] }
                                                      }
                                                   }
                                                }
                                             },
                                             0
                                          ]
                                       }
                                    },
                                    in: {
                                       _id: "$$prod._id",
                                       title: "$$prod.title",
                                       price: "$$prod.price",
                                       slug: "$$prod.slug",
                                       image: { $arrayElemAt: ["$$prod.images", 0] },
                                       offer: {
                                          $cond: {
                                             if: {
                                                $and: [
                                                   { $ne: ["$$productOffer", null] },
                                                   { $eq: ["$$productOffer.offerStatus", true] }
                                                ]
                                             },
                                             then: {
                                                discountValue: "$$productOffer.discountValue"
                                             },
                                             else: "$$REMOVE"
                                          }
                                       }
                                    }
                                 }
                              }
                           }
                        ]
                     }
                  }
               },

               // Transform newArrivals to include only what's needed
               newArrivals: {
                  $map: {
                     input: "$newArrivals",
                     as: "arrivalItem",
                     in: {
                        $mergeObjects: [
                           "$$arrivalItem",
                           {
                              productId: {
                                 $let: {
                                    vars: {
                                       prod: {
                                          $arrayElemAt: [
                                             {
                                                $filter: {
                                                   input: "$newArrivalsDetails",
                                                   as: "p",
                                                   cond: { $eq: ["$$p._id", "$$arrivalItem.productId"] }
                                                }
                                             },
                                             0
                                          ]
                                       },
                                       productOffer: {
                                          $arrayElemAt: [
                                             {
                                                $filter: {
                                                   input: "$newArrivalsOffers",
                                                   as: "o",
                                                   cond: {
                                                      $let: {
                                                         vars: {
                                                            product: {
                                                               $arrayElemAt: [
                                                                  {
                                                                     $filter: {
                                                                        input: "$newArrivalsDetails",
                                                                        as: "p",
                                                                        cond: { $eq: ["$$p._id", "$$arrivalItem.productId"] }
                                                                     }
                                                                  },
                                                                  0
                                                               ]
                                                            }
                                                         },
                                                         in: { $eq: ["$$o._id", "$$product.offer"] }
                                                      }
                                                   }
                                                }
                                             },
                                             0
                                          ]
                                       }
                                    },
                                    in: {
                                       _id: "$$prod._id",
                                       title: "$$prod.title",
                                       subTitle: "$$prod.subTitle",
                                       price: "$$prod.price",
                                       slug: "$$prod.slug",
                                       isUnderHotDeals: "$$prod.isUnderHotDeals",
                                       images: { $slice: ["$$prod.images", 2] },
                                       offer: {
                                          $cond: {
                                             if: {
                                                $and: [
                                                   { $ne: ["$$productOffer", null] },
                                                   { $eq: ["$$productOffer.offerStatus", true] }
                                                ]
                                             },
                                             then: {
                                                discountValue: "$$productOffer.discountValue",
                                                active: "$$productOffer.offerStatus"
                                             },
                                             else: "$$REMOVE"
                                          }
                                       }
                                    }
                                 }
                              }
                           }
                        ]
                     }
                  }
               },

               // Keep other fields with their populated data
               offerFeatured: 1,
               alltimeBestSellers: {
                  $let: {
                     vars: {
                        bestSellerProduct: { $arrayElemAt: ["$alltimeBestSellersDetails", 0] },
                        productOffer: {
                           $arrayElemAt: [
                              {
                                 $filter: {
                                    input: "$exclusiveProductsOffers", 
                                    as: "o",
                                    cond: {
                                       $let: {
                                          vars: {
                                             product: { $arrayElemAt: ["$alltimeBestSellersDetails", 0] }
                                          },
                                          in: { $eq: ["$$o._id", "$$product.offer"] }
                                       }
                                    }
                                 }
                              },
                              0
                           ]
                        }
                     },
                     in: {
                        $mergeObjects: [
                           "$$bestSellerProduct",
                           {
                              offer: {
                                 $cond: {
                                    if: {
                                       $and: [
                                          { $ne: ["$$productOffer", null] },
                                          { $eq: ["$$productOffer.offerStatus", true] }
                                       ]
                                    },
                                    then: {
                                       discountValue: "$$productOffer.discountValue"
                                    },
                                    else: "$$REMOVE"
                                 }
                              }
                           }
                        ]
                     }
                  }
               },
               womenFeatured: {
                  $map: {
                     input: "$womenFeatured",
                     as: "womenItem",
                     in: {
                        $mergeObjects: [
                           "$$womenItem",
                           {
                              productId: {
                                 $let: {
                                    vars: {
                                       prod: {
                                          $arrayElemAt: [
                                             {
                                                $filter: {
                                                   input: "$womenFeaturedDetails",
                                                   as: "p",
                                                   cond: { $eq: ["$$p._id", "$$womenItem.productId"] }
                                                }
                                             },
                                             0
                                          ]
                                       },
                                       productOffer: {
                                          $arrayElemAt: [
                                             {
                                                $filter: {
                                                   input: "$womenFeaturedOffers",
                                                   as: "o",
                                                   cond: {
                                                      $let: {
                                                         vars: {
                                                            product: {
                                                               $arrayElemAt: [
                                                                  {
                                                                     $filter: {
                                                                        input: "$womenFeaturedDetails",
                                                                        as: "p",
                                                                        cond: { $eq: ["$$p._id", "$$womenItem.productId"] }
                                                                     }
                                                                  },
                                                                  0
                                                               ]
                                                            }
                                                         },
                                                         in: { $eq: ["$$o._id", "$$product.offer"] }
                                                      }
                                                   }
                                                }
                                             },
                                             0
                                          ]
                                       }
                                    },
                                    in: {
                                       _id: "$$prod._id",
                                       title: "$$prod.title",
                                       price: "$$prod.price",
                                       slug: "$$prod.slug",
                                       image: { $arrayElemAt: ["$$prod.images", 0] },
                                       offer: {
                                          $cond: {
                                             if: {
                                                $and: [
                                                   { $ne: ["$$productOffer", null] },
                                                   { $eq: ["$$productOffer.offerStatus", true] }
                                                ]
                                             },
                                             then: {
                                                discountValue: "$$productOffer.discountValue"
                                             },
                                             else: "$$REMOVE"
                                          }
                                       }
                                    }
                                 }
                              }
                           }
                        ]
                     }
                  }
               }
            }
         }
      ];

      let homeContent = await HomeContent.aggregate(aggregationPipeline);

      // Handle case when no content exists
      if (!homeContent || homeContent.length === 0) {
         const newHomeContent = await HomeContent.create({
            heroBannerImages: [],
            exclusiveProducts: [],
            newArrivals: [],
            collections: [],
            offerFeatured: [],
            alltimeBestSellers: null,
            womenFeatured: []
         });

         homeContent = [newHomeContent];
      }

      // Return the first (and only) result
      return res.status(200).json({
         success: true,
         message: "Home content fetched successfully",
         homeContent: homeContent[0]
      });
   } catch (error) {
      console.error("Error fetching home content:", error);
      return res.status(500).json({
         success: false,
         message: "Failed to fetch home content",
         error: error.message || "Server error"
      });
   }
};
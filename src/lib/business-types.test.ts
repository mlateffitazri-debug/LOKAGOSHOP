import assert from 'node:assert/strict'
import {
  BUSINESS_TYPE_OPTIONS,
  CATEGORIES_BY_BUSINESS_TYPE,
  DEFAULT_BUSINESS_TYPE,
  DEFAULT_LISTING_LIMIT,
  DEFAULT_PLAN_TYPE,
  getCategoriesForBusinessType,
  isBusinessType,
  isListingLimitReached,
  normalizeBusinessType,
} from './business-types'

assert.deepEqual(BUSINESS_TYPE_OPTIONS, ['FOOD', 'SERVICE', 'PRODUCT', 'HOMESTAY'])
assert.equal(DEFAULT_BUSINESS_TYPE, 'FOOD')
assert.equal(DEFAULT_PLAN_TYPE, 'free')
assert.equal(DEFAULT_LISTING_LIMIT, 5)

assert.equal(isBusinessType('FOOD'), true)
assert.equal(isBusinessType('SERVICE'), true)
assert.equal(isBusinessType('PRODUCT'), true)
assert.equal(isBusinessType('HOMESTAY'), true)
assert.equal(isBusinessType('food'), false)
assert.equal(isBusinessType('BOOKING'), false)

assert.equal(normalizeBusinessType(undefined), 'FOOD')
assert.equal(normalizeBusinessType(null), 'FOOD')
assert.equal(normalizeBusinessType(''), 'FOOD')
assert.equal(normalizeBusinessType('service'), 'SERVICE')
assert.equal(normalizeBusinessType('PRODUCT'), 'PRODUCT')
assert.equal(normalizeBusinessType('bad-value'), 'FOOD')

assert.equal(isListingLimitReached({ planType: 'free', listingLimit: 5, listingCount: 4 }), false)
assert.equal(isListingLimitReached({ planType: 'free', listingLimit: 5, listingCount: 5 }), true)
assert.equal(isListingLimitReached({ planType: 'free', listingLimit: null, listingCount: 5 }), true)
assert.equal(isListingLimitReached({ planType: 'pro', listingLimit: 5, listingCount: 99 }), false)

for (const type of BUSINESS_TYPE_OPTIONS) {
  assert.ok(CATEGORIES_BY_BUSINESS_TYPE[type].length > 0, `${type} should have categories`)
}
assert.deepEqual(getCategoriesForBusinessType('SERVICE'), CATEGORIES_BY_BUSINESS_TYPE.SERVICE)
assert.deepEqual(getCategoriesForBusinessType('bad-value'), CATEGORIES_BY_BUSINESS_TYPE.FOOD)
assert.deepEqual(getCategoriesForBusinessType(undefined), CATEGORIES_BY_BUSINESS_TYPE.FOOD)

console.log('business type rules passed')

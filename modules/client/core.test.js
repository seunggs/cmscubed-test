import 'leaked-handles'
import test from 'tape'
import {
  sanitizeRoute,
  convertEnvToShortEnv,
  createEncodedQueryStr,
  deepCopyValues,
  getUpdatedPageContentFromSchemaChange,
  createContentUpdateObj,
  getPageContent,
  replaceContentSchemaValuesWithPlaceholders,
  // IMPURE
  updatePageContentOnSchemaChange
} from './core'

test('sanitizeRoute()', assert => {
  const route = '/products/'
  const actual = sanitizeRoute(route)
  const expected = '/products'

  assert.equal(actual, expected,
    `Given a route string with a trailing slash, sanitizeRoute() should remove
    the trailing slash`)

  const route2 = '/products'
  const actual2 = sanitizeRoute(route2)
  const expected2 = '/products'

  assert.equal(actual2, expected2,
    `Given a route string with no trailing slash, sanitizeRoute() should do
    nothing`)

  const route3 = '/'
  const actual3 = sanitizeRoute(route3)
  const expected3 = '/'

  assert.equal(actual3, expected3,
    `Given a root route, sanitizeRoute() should do nothing`)

  assert.end()
})

test('convertEnvToShortEnv()', assert => {
  const env = 'previewStagingDomain'
  const actual = convertEnvToShortEnv(env)
  const expected = 'staging'

  assert.equal(actual, expected,
    `Given an env string with 'preview' and 'Domain', convertEnvToShortEnv() should
    return an env string without 'preview' or 'Domain' in lowercase`)

  /* -------------------- */

  const env2 = 'prod'
  const actual2 = convertEnvToShortEnv(env2)
  const expected2 = 'prod'

  assert.equal(actual2, expected2,
    `Given an env string without 'preview', convertEnvToShortEnv() should return
    the original env string`)

  /* -------------------- */

  const env3 = 'previewProd'
  const actual3 = convertEnvToShortEnv(env3)
  const expected3 = 'prod'

  assert.equal(actual3, expected3,
    `Given an env string with 'preview', convertEnvToShortEnv() should return
    an env string without 'preview' in lowercase`)

  assert.end()
})

test('createEncodedQueryStr()', assert => {
  const projectDomain = 'test.com'
  const env = 'preview'
  const locale = 'en-US'
  const route = '/products/pro'
  const queryArray = [{projectDomain}, {env}, {locale}, {route}]
  const actual = createEncodedQueryStr(queryArray)
  const expected = 'projectDomain=test.com&env=preview&locale=en-US&route=%2Fproducts%2Fpro'

  assert.equal(actual, expected,
    `Given an array of variables, createEncodedQueryStr() should create a query
    string such as var1Name=encodedVar1Value&var2Name=encodedVar2Value`)

  assert.end()
})

test('deepCopyValues()', assert => {
  const fromObj = {
    heading: 'Old heading',
    text: 'Home text',
    list: [
      'old list',
      'item 2'
    ],
    benefits: {
      pro: 'Pro benefits',
      hacker: 'Hacker benefits',
      subBenefits: {
        benefit1: 'subBenefit 1'
      }
    }
  }
  const toObj = {
    heading: 'Changed heading',
    addedKey: 'Something',
    list: [
      'new list',
      'item 2'
    ],
    benefits: {
      pro: 'Pro benefits',
      hacker: 'Hacker benefits',
      anotherAddedKey: 'Something else'
    }
  }
  const actual = deepCopyValues(fromObj, toObj)
  const expected = {
    heading: 'Old heading',
    addedKey: 'Something',
    list: [
      'old list',
      'item 2'
    ],
    benefits: {
      pro: 'Pro benefits',
      hacker: 'Hacker benefits',
      anotherAddedKey: 'Something else'
    }
  }

  assert.deepEqual(actual, expected,
    `deepCopyValues() should deep copy all values from fromObj into toObj`)

  assert.end()
})

test('getUpdatedPageContentFromSchemaChange()', assert => {
  const currentPageContent = {
    heading: 'Old heading',
    text: 'Home text',
    list: ['old list', 'item 2'],
    benefits: {
      pro: 'Pro benefits',
      hacker: 'Hacker benefits',
      subBenefits: {
        benefit1: 'subBenefit 1'
      }
    }
  }
  const newSchemaObj = {
    heading: 'Changed heading',
    addedKey: 'Something',
    list: ['new list', 'item 2'],
    benefits: {
      pro: 'Pro benefits',
      hacker: 'Hacker benefits',
      anotherAddedKey: 'Something else'
    }
  }
  const actual = getUpdatedPageContentFromSchemaChange(currentPageContent, newSchemaObj)
  const expected = {
    heading: 'Old heading',
    addedKey: 'Something',
    list: ['old list', 'item 2'],
    benefits: {
      pro: 'Pro benefits',
      hacker: 'Hacker benefits',
      anotherAddedKey: 'Something else'
    }
  }

  assert.deepEqual(actual, expected,
    `Given the current pageContent and a new schema object,
    getUpdatedPageContentFromSchemaChange() should return updated pageContent
    (with new keys from new schema object and old values from current
    pageContent)`)

  /* -------------------- */

  const currentPageContent2 = undefined
  const newSchemaObj2 = {
    heading: 'Changed heading',
    list: ['new list', 'item 2'],
    benefits: {
      pro: 'Pro benefits',
      hacker: 'Hacker benefits',
      anotherAddedKey: 'Something else'
    }
  }
  const actual2 = getUpdatedPageContentFromSchemaChange(currentPageContent2, newSchemaObj2)
  const expected2 = {
    heading: 'Changed heading',
    list: ['new list', 'item 2'],
    benefits: {
      pro: 'Pro benefits',
      hacker: 'Hacker benefits',
      anotherAddedKey: 'Something else'
    }
  }

  assert.deepEqual(actual2, expected2,
    `getUpdatedPageContentFromSchemaChange() should return a pageContent that's
    identical to new schemaObj if the page doesn't already exist`)

  /* -------------------- */

  const currentPageContent3 = {
    heading: 'Changed heading',
    list: ['new list', 'item 2'],
    benefits: {
      pro: 'Pro benefits',
      hacker: 'Hacker benefits',
      anotherAddedKey: 'Something else'
    }
  }
  const newSchemaObj3 = {
    heading: 'Changed heading',
    list: ['new list', 'item 2'],
    benefits: {
      pro: 'Pro benefits',
      hacker: 'Hacker benefits',
      anotherAddedKey: 'Something else'
    }
  }
  const actual3 = getUpdatedPageContentFromSchemaChange(currentPageContent3, newSchemaObj3)
  const expected3 = null

  assert.deepEqual(actual3, expected3,
    `getUpdatedPageContentFromSchemaChange() should return null if
    contentSchema hasn't changed`)

  assert.end()
})

test('createContentUpdateObj()', assert => {
  const projectDomain = 'test.com'
  const env = 'preview'
  const locale = 'en-US'
  const route = '/products/pro'
  const updatedPageContent = {
    heading: 'Some heading',
    text: 'Some text'
  }
  const actual = createContentUpdateObj(projectDomain, env, locale, route, updatedPageContent)
  const expected = {projectDomain, env, locale, route, content: updatedPageContent}

  assert.deepEqual(actual, expected,
    `Given projectDomain, env, locale, route, updatedPageContent,
    createContentUpdateObj() should output an object with following keys and
    values: {project, env, locale, route, content}`)

  assert.end()
})

test('getPageContent()', assert => {
  const route = '/products/hacker'
  const rootContent = {
    "/": {
      heading: 'Home heading'
    },
    "/products": {
      heading: 'Products heading'
    },
    "/products/hacker": {
      heading: 'Hacker heading',
      text: 'Hacker text'
    }
  }
  const actual = getPageContent(route, rootContent)
  const expected = {
    heading: 'Hacker heading',
    text: 'Hacker text'
  }

  assert.deepEqual(actual, expected,
    `Given a route string and rootC3Obj object, getPageContent() should
    output pageContent object`)

  /* -------------------- */

  const route2 = '/products/pro'
  const rootContent2 = {
    "/": {
      heading: 'Home heading'
    },
    "/products": {
      heading: 'Products heading'
    },
    "/products/hacker": {
      heading: 'Hacker heading',
      text: 'Hacker text'
    }
  }
  const actual2 = getPageContent(route2, rootContent2)
  const expected2 = undefined

  assert.deepEqual(actual2, expected2,
    `Given no matching route, getPageContent() should return undefined`)

  /* -------------------- */

  const route3 = '/products/pro'
  const rootContent3 = undefined
  const actual3 = getPageContent(route3, rootContent3)
  const expected3 = undefined

  assert.deepEqual(actual3, expected3,
    `Given an undefined rootContent, getPageContent() should return undefined`)

  assert.end()
})

test('replaceContentSchemaValuesWithPlaceholders()', assert => {
  const contentSchema = {
    heading: 'Heading',
    benefits: [
      {
        first: 'Benefit 1'
      },
      {
        second: ['Second 1', 'Second 2']
      },
    ],
    sub: {
      heading: 'Sub heading',
      list: ['a', 'b', 'c']
    }
  }
  const actual = replaceContentSchemaValuesWithPlaceholders(contentSchema)
  const expected = {
    heading: '-------',
    benefits: [
      {
        first: '---------'
      },
      {
        second: ['--------', '--------']
      },
    ],
    sub: {
      heading: '-----------',
      list: ['-', '-', '-']
    }
  }

  assert.deepEqual(actual, expected,
    `Given contentSchema, replaceContentSchemaValuesWithPlaceholders() should
    return all values replaced with placeholder character`)

  assert.end()
})

/* --- IMPURE --------------------------------------------------------------- */

test('updatePageContentOnSchemaChange()', assert => {
  const localStorageMock = {
    getItem(key) { return },
    setItem(key, value) { return }
  }
  const currentDomain = 'cmscubed-test.com'
  const route = '/products'
  const rootContent = {
    '/': {
      heading: 'Home heading',
    },
    '/products': {
      heading: 'Products heading'
    }
  }
  const schemaObj = {
    heading: 'Products heading',
    text: 'Products text'
  }
  const actual = updatePageContentOnSchemaChange(localStorageMock, currentDomain, route, rootContent, schemaObj)
  const expected = true

  assert.equal(actual, expected,
    `If schemaObj has different keys from current pageContent,
    updatePageContentOnSchemaChange() should return true`)

  /* -------------------- */

  const route2 = '/products'
  const rootContent2 = {
    '/': {
      heading: 'Home heading',
    },
    '/products': {
      heading: 'Products heading'
    }
  }
  const schemaObj2 = {
    heading: 'Products heading'
  }
  const actual2 = updatePageContentOnSchemaChange(localStorageMock, currentDomain, route2, rootContent2, schemaObj2)
  const expected2 = false

  assert.equal(actual2, expected2,
    `If schemaObj and pageContent are identical (not the same object, but
    same attributes and values), updatePageContentOnSchemaChange() should
    return false`)

  /* -------------------- */

  const route3 = '/products'
  const rootContent3 = undefined
  const schemaObj3 = {
    heading: 'Products heading'
  }
  const actual3 = updatePageContentOnSchemaChange(localStorageMock, currentDomain, route3, rootContent3, schemaObj3)
  const expected3 = false

  assert.equal(actual3, expected3,
    `If rootContent supplied is nil, sendPageContent() should return false`)

  assert.end()
})

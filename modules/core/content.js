import R from 'ramda'
import socket from '../websockets/'
import locales from './data/locales'
import parseDomain from 'parse-domain'
import {sanitizeRoute} from '../client/core'

const log = x => { console.log(x); return x }

// sanitizeDomain :: String -> String
export const sanitizeDomain = R.curry(inputDomain => {
  const {subdomain, domain, tld} = parseDomain(inputDomain)
  return R.compose(R.join('.'), R.reject(R.either(R.isNil, R.isEmpty)))([subdomain, domain, tld])
})

// convertRouteToPathArray :: String -> [String]
export const convertRouteToPathArray = R.compose(R.reject(R.isEmpty), R.split('/'))

// createPreviewDomain :: String -> String
export const createPreviewDomain = R.curry((prodDomain, env, locale) => {
  const {subdomain, domain} = parseDomain(prodDomain)
  return R.isEmpty(subdomain) ? `c3-${domain}-preview-${env}-${locale}.surge.sh` : `c3-${subdomain}-${domain}-preview-${env}-${locale}.surge.sh`
})

// getProjectRoute :: String -> String
export const getProjectRoute = route => {
  return route.replace('/edit', '') === '/$root' ? '/' : route.replace('/edit', '')
}

// getPageContent :: String -> {*} -> {*}
export const getPageContent = R.curry((route, rootContent) => {
  const sanitizedRoute = sanitizeRoute(route)
  const pageContent = R.prop(sanitizedRoute, rootContent)
  return pageContent
})

// createContentUpdateObj :: String -> String -> String -> {*} -> [*]
export const createContentUpdateObj = R.curry((project, locale, route, pageContent) => {
  const sanitizedRoute = sanitizeRoute(route)
  return [project, locale, sanitizedRoute, pageContent]
})

// createRouteTree :: {*} -> [*]
export const createRouteTree = R.curry(rootContent => {
  const createNestedRoutes = R.curry(rootContent => {
    const routes = R.compose(R.map(sanitizeRoute), R.keys)(rootContent)
    const nestedRoutes = R.reduce((prev, route) => R.assocPath(convertRouteToPathArray(route), {}, prev), {})(routes)
    return nestedRoutes
  })
  const nestedRootContent = createNestedRoutes(rootContent)

  const getChildRoutes = R.curry(obj => {
    const childRoutes = R.keys(obj)
    return childRoutes.map(key => ({path: key, childRoutes: getChildRoutes(obj[key])}))
  })
  return [{ path: '/', childRoutes: getChildRoutes(nestedRootContent)}]
})

// isValidLocale :: [*] -> String -> Boolean
export const isValidLocale = R.curry(locale => R.indexOf(locale, locales.valid) !== -1)

// convertDBContentObjsToContent :: String -> {*} -> {*}
export const convertDBContentObjsToContent = R.curry(dbContentObjs => {
  const content = dbContentObjs.reduce((prev, dbContentObj) => {
    return R.assoc(R.prop('route', dbContentObj), R.prop('content', dbContentObj), prev)
  }, {})
  console.log('content inside convertDBContentObjsToContent: ', content)
  return R.isEmpty(content) ? {} : content
})

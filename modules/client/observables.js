import Rx from 'rx-lite'
import R from 'ramda'
import config from './config'

import {createEncodedQueryStr, convertEnvToShortEnv} from './core'

// getInitContent$$ :: String -> String -> [*] -> Observable ({*})
// Returns contentInitObj = {projectDetails, env, isPreview, routeContent}
export const getInitContent$$ = (projectDomain, domain, route, excludedRoutes) => {
  return Rx.Observable.create(observer => {
    let cancelled = false

    if (!cancelled) {
      // ?projectDomain=x&domain=x&route=encodedX&excludedRoutes=encodedX,encodedY
      const encodedQueryStr = createEncodedQueryStr([{projectDomain}, {domain}, {route}, {excludedRoutes}])
      fetch(config.apiBase + '/api/client/contents/init?' + encodedQueryStr)
        .then(data => data.json())
        .then(contentInitObj => {
          console.log('contentInitObj: ', contentInitObj)
          observer.onNext(contentInitObj)
          observer.onCompleted()
        })
        .catch(err => observer.onError(err))
    }

    return () => {
      cancelled = true
      console.log('getInitContent$$ disposed')
    }
  })
}

export const checkIsPreview$ = Rx.Observable.fromEvent(global, 'message')
  .map(e => {
    console.log('checkIsPreview$ e: ', e)
    if (e.origin !== 'https://cmscubed.com' || e.origin !== 'http://127.0.0.1:3333') { return null }
    return e
  })

export const getUpdatedRouteContentWS$$ = socket => {
  return Rx.Observable.create(observer => {
    let cancelled = false

    if (!cancelled) {
      socket.on('routeContent:fromDB', routeContent => {
        console.log('getUpdatedRouteContentWS$$ routeContent received!')
        observer.onNext(routeContent)
      })
    }

    return () => {
      cancelled = true
      console.log('getInitContent$$ disposed')
    }
  })
}

export const getUpdatedContentFieldWS$$ = socket => {
  return Rx.Observable.create(observer => {
    let cancelled = false

    if (!cancelled) {
      socket.on('contentField:update', fieldObj => {
        // fieldObj: {keyPath, value}
        observer.onNext(fieldObj)
      })
    }

    return () => {
      cancelled = true
      console.log('getInitContent$$ disposed')
    }
  })
}

export const getUpdatedContentWS$$ = socket => {
  return Rx.Observable.combineLatest(
    getUpdatedRouteContentWS$$(socket),
    getUpdatedContentFieldWS$$(socket)
  ).map(change => {
    const routeContent = change[0]
    const field = change[1]
    return R.assocPath(field.keyPath, field.value, routeContent)
  })
}

// updatePageContent$$ :: {*} -> {*}
export const updatePageContent$$ = contentUpdateObj => {
  return Rx.Observable.create(observer => {
    fetch(config.apiBase + '/api/contents/page', {
      method: 'put',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contentUpdateObj)
    })
      .then(res => res.json())
      .then(dbRes => {
        observer.onNext(dbRes)
        observer.onCompleted()
      })
      .catch(err => observer.onError())
  })
}

// loadSocketIoClient$
export const loadSocketIoClient$ = Rx.Observable.create(observer => {
  fetch('https://cdn.socket.io/socket.io-1.4.5.js')
    .then(() => {
      observer.onNext()
      observer.onCompleted()
    })
    .catch(err => observer.onError(err))
})

// // getRouteContent$$ :: {*} -> String -> String -> String -> Observable
// export const getRouteContent$$ = (projectDomain, env, locale, route) => {
//   return Rx.Observable.create(observer => {
//     const queryStr = createEncodedQueryStr([{projectDomain}, {env}, {locale}, {route}])
//     fetch(config.apiBase + '/api/contents/route?' + queryStr)
//       .then(res => res.json())
//       .then(routeContent => {
//         observer.onNext(routeContent)
//         observer.onCompleted()
//       })
//       .catch(err => observer.onError(err))
//   })
// }

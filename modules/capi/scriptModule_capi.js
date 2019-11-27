const fetchRetry = require('../scriptModule_fetchRetry');

module.exports = {
  checkBlacklist: async (url, blacklistType, query) => {
    var blacklistURL;
    if (blacklistType === 'cmdr') {
      blacklistURL = url + '/excludecmdrs?cmdrName=' + encodeURIComponent(query);
    } else if (blacklistType === 'client') {
      blacklistURL = url + '/excludeclients?version=' + encodeURIComponent(query);
    }
  
    let response = await fetchRetry( blacklistURL, 5, 500, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  
    return await response.json();
  }
}
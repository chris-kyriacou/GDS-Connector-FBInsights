function getConfig(request) {
  
  //developer mode
  is_dev = true
  
  var service = getService();
  var response = JSON.parse(UrlFetchApp.fetch("https://graph.facebook.com/me/accounts", {
    headers: {
      Authorization: 'Bearer ' + service.getAccessToken()
    }
  }));
  var config = {
    configParams: [
      {
        type: "SELECT_SINGLE",
        name: "pageID",
        displayName: "Page ID",
        helpText: "Please select the Page ID for which you would like to retrieve the Statistics.",
        options: []
      }
    ],
    dateRangeRequired: true
  };
  response.data.forEach(function(field) {
    config.configParams[0].options.push({
      label: field.name,
      value: field.id
    });
  })
  var storeAccessToken = response.data[0].access_token;
  var pageID = response.data[0].id
  Logger.log(storeAccessToken);
  return config;
};


var facebookSchema = [
  {
    name: 'timestamp',
    label: 'Timestamp',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'timestampWeek',
    label: 'Timestamp Week',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'timestampMonth',
    label: 'Timestamp Month',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'likes',
    label: 'Likes Total',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC'
    }
  },
  {
    name: 'impressions_daily',
    label: 'Impressions',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC'
    }
  },
  {
    name: 'engagements_daily',
    label: 'Page Post Engagements',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC'
    }
  }
];

function getSchema(request) {
  return {schema: facebookSchema};
};

function getData(request) {
  var service = getService();
  
/*function shortenUrl(longLink) {
  var fldAPIKey = 'AIzaSyDCAw7P7W4zB3AkDDQXv9A-uOb4i13ShRg';
  var apiUrl = 'https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=' + fldAPIKey;
  var method = 'POST';
  var header = {
    'Content-Type' : 'application/json'
  }  
  var prefix = 'https://christhedataguy.page.link'; // To give it a branded flavour
  var formData = {
   "longDynamicLink": "https://christhedataguy.page.link/?link=" + longLink + "&ibi=dummy.com",
   "suffix": {
     "option": "SHORT"
   }
}
  var payload = JSON.stringify(formData);
  var options = {
    'method'  : method,
    'headers' : header,
    'payload' : payload
  };  
  var response = UrlFetchApp.fetch(apiUrl, options);
  response = JSON.parse(response.getContentText());
  var shortLink = response.shortLink;
  return shortLink;
}
  */
  var response = JSON.parse(UrlFetchApp.fetch("https://graph.facebook.com/me/accounts", {
     headers: {
       Authorization: 'Bearer ' + service.getAccessToken()
     }
   }));
  
  var storeAccessToken = response.data[0].access_token;
    
  function dateDelta(dObj, num) {
    if (isNaN(num)) {
      var dateStart = new Date(dObj);
    } else {
      var dateStart = new Date(dObj);
      var dateStart = new Date(dateStart.setDate(dateStart.getDate() + num));
    }
    var dd = dateStart.getDate();
    var mm = dateStart.getMonth()+1; //January is 0!
    
    var yyyy = dateStart.getFullYear();
    if(dd<10){
        dd='0'+dd;
    } 
    if(mm<10){
        mm='0'+mm;
    } 
    var dateStart = yyyy + "-" + mm + "-" + dd;
    return dateStart;
  }
  

  //debug only
  var gStartDate = '1/1/2020';
  
  if (is_dev = false)
  {
    var gStartDate = new Date(request.dateRange.startDate);
  }
  var gStartDate = new Date(dateDelta(gStartDate, -1));
  
  //debug only
  var gEndDate = '23/5/2020';
  
  if (is_dev = false)
  {
    var gEndDate = new Date(request.dateRange.endDate);
  }
   
  var gEndDate = new Date(dateDelta(gEndDate, +1));
  var gRange = Math.ceil(Math.abs(gEndDate - gStartDate) / (1000 * 3600 * 24));
  var gBatches = Math.ceil(gRange / 92);

  if (gBatches < 2) {
    var batch = [{"method": "GET", "relative_url": request.configParams.pageID + "/insights?metric=page_fans,page_impressions,page_post_engagements&access_token=" + storeAccessToken + "&since=" + dateDelta(gStartDate) + "&until=" + dateDelta(gEndDate)}];
    console.log(batch);
  } else {
    batch = [];
    var iterRanges = gRange / gBatches;
    
    for (i = 0; i < gBatches; i++) {
      var iterStart = dateDelta(gStartDate, (iterRanges * i));
      if (i == (gBatches - 1)) {
        var iterEnd = dateDelta(gEndDate);
      } else {
        var iterEnd = dateDelta(gStartDate, (iterRanges * (i + 1)) + 1);
      }
      //batch.push({"method": "GET", "relative_url": "105440834519763/insights?metric=page_fans,page_impressions,page_post_engagements&access_token=" + storeAccessToken + "&since=" + iterStart + "&until=" + iterEnd})
      batch.push("105440834519763/insights?metric=page_fans,page_impressions,page_post_engagements&access_token=" + storeAccessToken + "&since=" + iterStart + "&until=" + iterEnd)
    }
    //Logger.log(batch);
    //Logger.log("Page Access Token: " + storeAccessToken)
    
    
  }
  var allData = [];
  var dataSchema = [];

  batch.forEach(function(reqElement)
    {
      var url = "https://graph.facebook.com/" + reqElement
      //Logger.log(url);

      var response = JSON.parse(UrlFetchApp.fetch(url, {
    method: 'GET',
    headers: {    
        Authorization: 'Bearer ' + service.getAccessToken()
    }
    
        
  }));
      
      
    });

 //TODO
 // Parse JSON data into schema
// 

};

fetch("https://secure07c.chase.com/svc/rr/accounts/secure/card/activity/ods/v2/detail/list", {
  "headers": {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"91\", \"Chromium\";v=\"91\"",
    "sec-ch-ua-mobile": "?0",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-jpmc-channel": "id=C30",
    "x-jpmc-client-request-id": "6aae38ac-c364-412a-b62f-ce0643124117",
    "x-jpmc-csrf-token": "NONE"
  },
  "referrer": "https://secure07c.chase.com/web/auth/dashboard",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": "accountId=288567949&transactionId=202106231239154210613%2320210613&postDate=20210623&cardReferenceNumber=239807937&relatedAccountId=288567949&merchantName=AMZN+Mktp+US*215PK8791",
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
});

args = {
  "accountId": "288567949",
  "transactionId": "202106231239154210613%2320210613",
  "postDate": "20210623",
  "cardReferenceNumber": "239807937",
  "relatedAccountId": "288567949",
  "merchantName": "AMZN+Mktp+US*215PK8791",
}

response = {
  "code":"SUCCESS",
  "entryMode":"NON_RFID_TRANSACTION",
  "activityType":"ONLINE",
  "addressLine":"",
  "city":"",
  "merchantAlias":"Amazon Marketplace",
  "merchantName":"Amazon.com",
  "merchantOrderDescription":"Order number 112-0194176-1765899",
  "merchantOrderId":"112-0194176-1765899",
  "merchantOrderUrl":"https:\u002F\u002Fwww.amazon.com\u002Fgp\u002Fcss\u002Forder-history",
  "phone":"",
  "recurringMerchant":false,
  "rewardDetails": [
    {"rewardId":"9100152901",
     "rewardsEarned":"12.34",
     "retroactiveReward":false
    },
    {"rewardId":"4300000800",
     "rewardsEarned":"99.99",
     "retroactiveReward":false
    }
  ],
  "rpc":"0510",
  "state":"",
  "suggestedMerchantName":"Amazon.com",
  "totalRewardsEarned":"999.99",
  "zipCode":"",
  "suggestedAddressLine":"",
  "suggestedCity":"",
  "suggestedPhone":"",
  "suggestedState":"",
  "suggestedZipCode":"",
  "cardReferenceNumber":123456789,
  "cardMask":"1234",
  "postDate":"20210623",
  "postTime":"1239154",
  "memo":"",
  "merchantCategoryCode":5942,
}


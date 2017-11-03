const Axios = require('axios')

module.exports = (publicId, apiPassword, body, accept, decline) => {

  Axios({
    method: 'post',
    auth: {
      username: publicId,
      password: apiPassword
    },
    url: 'https://api.cloudpayments.kz/payments/cards/post3ds',
    data: {
      TransactionId: body.MD,
      PaRes: body.PaRes
    }
  }).then((response) => {
    if (response.data.Success) {
      if (response.data.Model.Reason === 'Approved') {
        accept(response.data.Model)
      } else {
        decline()
      }
    } else {
      decline()
    }
  }).catch((err) => {
    return decline()
  })

}

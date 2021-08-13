/* eslint-disable max-statements */
'use strict'

module.exports.getIgMedia = async(req, reply) => {
  const images = [
    {
      'mediaId': '1',
      'mediaUrl': 'https://instagram.ffco3-1.fna.fbcdn.net/v/t51.2885-15/e35/91291623_202618881183579_2977596168650401349_n.jpg?_nc_ht=instagram.ffco3-1.fna.fbcdn.net&_nc_cat=103&_nc_ohc=SxqSa2TiH30AX83aMno&edm=AABBvjUBAAAA&ccb=7-4&oh=55f9f237243aaf15488b8f0dc223a100&oe=611C79F8&_nc_sid=83d603',
      'permaurl': 'https://instagram.ffco3-1.fna.fbcdn.net/v/t51.2885-15/e35/91291623_202618881183579_2977596168650401349_n.jpg?_nc_ht=instagram.ffco3-1.fna.fbcdn.net&_nc_cat=103&_nc_ohc=SxqSa2TiH30AX83aMno&edm=AABBvjUBAAAA&ccb=7-4&oh=55f9f237243aaf15488b8f0dc223a100&oe=611C79F8&_nc_sid=83d603',
      'caption': 'Russia - National Day',
      'createdAt': 'string',
      'updatedAt': 'string',
    },
    {
      'mediaId': '2',
      'mediaUrl': 'https://instagram.ffco3-1.fna.fbcdn.net/v/t51.2885-15/e35/90707507_239801480393135_3208613769819767321_n.jpg?_nc_ht=instagram.ffco3-1.fna.fbcdn.net&_nc_cat=111&_nc_ohc=wQkcA8zdG-MAX_-Ahj9&tn=Qc46BshqH4TMi4Fb&edm=AABBvjUBAAAA&ccb=7-4&oh=ee26e12833587e070a9a91d40ec72e9b&oe=611C6AF6&_nc_sid=83d603',
      'permaurl': 'https://instagram.ffco3-1.fna.fbcdn.net/v/t51.2885-15/e35/90707507_239801480393135_3208613769819767321_n.jpg?_nc_ht=instagram.ffco3-1.fna.fbcdn.net&_nc_cat=111&_nc_ohc=wQkcA8zdG-MAX_-Ahj9&tn=Qc46BshqH4TMi4Fb&edm=AABBvjUBAAAA&ccb=7-4&oh=ee26e12833587e070a9a91d40ec72e9b&oe=611C6AF6&_nc_sid=83d603',
      'caption': 'Bangladesh - Independence Day',
      'createdAt': 'string',
      'updatedAt': 'string',
    },
    {
      'mediaId': '3',
      'mediaUrl': 'https://instagram.ffco3-1.fna.fbcdn.net/v/t51.2885-15/e35/90953381_128368268754863_6968665205954332609_n.jpg?_nc_ht=instagram.ffco3-1.fna.fbcdn.net&_nc_cat=111&_nc_ohc=zCPHjhLbD8cAX9HBtc1&edm=AABBvjUBAAAA&ccb=7-4&oh=1ca204ca1a74de3e73efc69a18153ed3&oe=611CE2C2&_nc_sid=83d603',
      'permaurl': 'https://instagram.ffco3-1.fna.fbcdn.net/v/t51.2885-15/e35/90953381_128368268754863_6968665205954332609_n.jpg?_nc_ht=instagram.ffco3-1.fna.fbcdn.net&_nc_cat=111&_nc_ohc=zCPHjhLbD8cAX9HBtc1&edm=AABBvjUBAAAA&ccb=7-4&oh=1ca204ca1a74de3e73efc69a18153ed3&oe=611CE2C2&_nc_sid=83d603',
      'caption': 'Greek - Independence Day',
      'createdAt': 'string',
      'updatedAt': 'string',
    },
    {
      'mediaId': '4',
      'mediaUrl': 'https://instagram.ffco3-1.fna.fbcdn.net/v/t51.2885-15/e35/90261746_148073843348718_7732910416385236523_n.jpg?_nc_ht=instagram.ffco3-1.fna.fbcdn.net&_nc_cat=106&_nc_ohc=9ENQziMansoAX99Abvm&edm=AABBvjUBAAAA&ccb=7-4&oh=80f4bb00bc3fd11b0c31298059ff8945&oe=611E58EC&_nc_sid=83d603',
      'permaurl': 'https://instagram.ffco3-1.fna.fbcdn.net/v/t51.2885-15/e35/90261746_148073843348718_7732910416385236523_n.jpg?_nc_ht=instagram.ffco3-1.fna.fbcdn.net&_nc_cat=106&_nc_ohc=9ENQziMansoAX99Abvm&edm=AABBvjUBAAAA&ccb=7-4&oh=80f4bb00bc3fd11b0c31298059ff8945&oe=611E58EC&_nc_sid=83d603',
      'caption': 'Japan - Vernal Equinox Day',
      'createdAt': 'string',
      'updatedAt': 'string',
    },


  ]
  reply.send(images)
}

//const BASE_URL = "/vip-api";
const BASE_URL = "http://localhost:4600";

export const API_ENDPOINTS = {
   authenticate:`${BASE_URL}/auth`,
   reference:`${BASE_URL}/reference`,
   referencemaster:`${BASE_URL}/reference-master`,
   userMgmt:`${BASE_URL}/usermgmt`,
   users:`${BASE_URL}/users`,
   referenceWorkFlow:`${BASE_URL}/api/reference`,
   draftReply:`${BASE_URL}/api/draft-reply`,
   linkedReferences:`${BASE_URL}/linked-references`,
   reports:`${BASE_URL}/api/reports`,
   categories:`${BASE_URL}/api/categories`,
   subcategories:`${BASE_URL}/api/subcategories`,
   documentTypes:`${BASE_URL}/api/document-types`
  };
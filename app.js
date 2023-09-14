require('dotenv').config();
const logger = require('./logger').console;
const pvsRegion = process.env.PVS_REGION;
const pvsApikey = process.env.PVS_APIKEY;
const pvsCrn = process.env.PVS_CRN;
const pvsInstanceId = process.env.PVS_INSTNCEID;
const pvsCoreSize = process.env.PVS_CORE_SIZE;
const pvsMemorySize = process.env.PVS_MEMORY_SIZE;
const toolIdentifyCode = 'PVS-RSR-CHG';
const toolPrefix = process.env.TOOL_PREFIX ? `${process.env.TOOL_PREFIX}-${toolIdentifyCode}` : toolIdentifyCode;
const resourceChangeWaitSecond = 120;
const loopIntervalSecond = 30;
const loopLimit = 5;
const iamEndpointUrl = 'https://iam.cloud.ibm.com/identity/token';
const iamRequestOptions = {
  method: 'POST',
  headers: { 
    "Content-Type": "application/x-www-form-urlencoded",
    "Accept": "application/json",
  },
}

const error = (msgId, msg) => {
  const errorMessage = `[${toolPrefix}-${msgId}] ${msg}`;
  logger.error(errorMessage);
  process.exit(1);
}

const warn = (msgId, msg) => {
  const message = `[${toolPrefix}-${msgId}] ${msg}`;
  logger.warn(message);
}

const info = (msgId, msg) => {
  const message = `[${toolPrefix}-${msgId}] ${msg}`;
  logger.info(message);
}

const sleep = (sec) => {return new Promise((resolve, reject) =>{
  setTimeout(() => {
    resolve();
  }, sec * 1000)
})}

const requiredIsParamCheck = () => {
  let errFlg = false;
  let missingParam = '';
  if(!pvsRegion){
    errFlg = true;
    missingParam += 'PVS_REGION '
  }
  if(!pvsApikey){
    errFlg = true;
    missingParam += 'PVS_APIKEY '
  }
  if(!pvsCrn){
    errFlg = true;
    missingParam += 'PVS_CRN '
  }
  if(!pvsInstanceId){
    errFlg = true;
    missingParam += 'PVS_INSTNCEID '
  }
  if(!pvsCoreSize){
    errFlg = true;
    missingParam += 'PVS_CORE_SIZE '
  }
  if(!pvsMemorySize){
    errFlg = true;
    missingParam += 'PVS_MEMORY_SIZE '
  }
  if(errFlg){
    error('E001',`Required Parameter ${missingParam}not defined`)
  }
}

const requiredParamFormatCheck = () => {
  let errFlg = false;
  let errMsg = '';
  if(!pvsCrn.includes('::')){
    errFlg = true;
    errMsg += `PVS_CRN is not formated. `;
  }
  if(isNaN(pvsCoreSize)){
    errFlg = true;
    errMsg += `PVS_CORE_SIZE[${pvsCoreSize}] is not number. `;
  }else{
    if(pvsCoreSize < 0){
      errFlg = true;
      errMsg += `PVS_CORE_SIZE[${pvsCoreSize}] cannot be negative. `;
    }else{
      if((pvsCoreSize*100 % 25) !== 0){
        errFlg = true;
        errMsg += `PVS_CORE_SIZE[${pvsCoreSize}] is not a suitable value for the specification. `;
      }
    }
  }
  if(isNaN(pvsMemorySize)){
    errFlg = true;
    errMsg += `PVS_MEMORY_SIZE is not number. `;
  }else{
    if(pvsMemorySize < 0){
      errFlg = true;
      errMsg += `PVS_MEMORY_SIZE[${pvsMemorySize}] cannot be negative. `;
    }else{
      if((pvsMemorySize*100 % 100) !== 0){
        errFlg = true;
        errMsg += `PVS_MEMORY_SIZE[${pvsMemorySize}] is not a suitable value for the specification. `;
      }
    }
  }
  if(errFlg){
    error('E002',`${errMsg}`)
  }
}

const iamResponseCheck = async (response) => {
  if(response.status !== 200){
    try{
      const fatalErrorMessage = 'Something error occuered in generate access token.';
      const iamJson = await response.json();
      const errMsg = iamJson.errorMessage ? iamJson.errorMessage : fatalErrorMessage;
      error('E101',`Response HTTP Status : ${response.status}. ${errMsg}`);
    }catch(err){
      logger.error(err);
      error('E901',`Response HTTP Status : ${response.status}. ${fatalErrorMessage}`);
    }
  }
}

const iamJsonCheck = (json) => {
  if(!json.access_token){
    error('E201','Access token is not included in IAM response');
  }
}

const pvsBaseResponseCheck = async (response) => {
  if(response.status !== 200){
    try{
      const fatalErrorMessage = 'Something fatal error occuered in power virtual server authorization check.';
      const responseJson = await response.json();
      const errMsg = responseJson.message ? responseJson.message : ( responseJson.description ? responseJson.description : fatalErrorMessage);
      error('E102',`Response HTTP Status : ${response.status}. ${errMsg}`);
    }catch(err){
      logger.error(err);
      error('E302',`Response HTTP Status : ${response.status}. ${fatalErrorMessage}`);
    }
  }
}

const pvsInstancesResponseCheck = async (response) => {
  if(response.status !== 200){
    try{
      const fatalErrorMessage = 'Something fatal error occuered in power virtual server instances authorization check.';
      const responseJson = await response.json();
      const errMsg = responseJson.message ? responseJson.message : ( responseJson.description ? responseJson.description : fatalErrorMessage);
      error('E103',`Response HTTP Status : ${response.status}. ${errMsg}`);
    }catch(err){
      logger.error(err);
      error('E304',`Response HTTP Status : ${response.status}. ${fatalErrorMessage}`);
    }
  }
}

const pvsInstancesJsonCheck = (json) => {
  const filterdArray = json.pvmInstances.filter(instance => instance.pvmInstanceID === pvsInstanceId);
  if(filterdArray.length === 0){
    error('E003', `Defined Instance ID(${pvsInstanceId}) does not exist in the specified Power Virtual Server Workspace`);
  }
}

const pvsInstanceResponseCheck = async (response) => {
  if(response.status !== 200){
    try{
      const fatalErrorMessage = 'Something fatal error occuered in get power virtual server instance information.';
      const responseJson = await response.json();
      const errMsg = responseJson.message ? responseJson.message : ( responseJson.description ? responseJson.description : fatalErrorMessage);
      error('E104',`Response HTTP Status : ${response.status}. ${errMsg}`);
    }catch(err){
      logger.error(err);
      error('E904',`Response HTTP Status : ${response.status}. ${fatalErrorMessage}`);
    }
  }
}

const pvsInstanceJsonCheck = (json) => {
  let errFlg = false;
  let errMsg = '';
  if(json.maxmem < pvsMemorySize ||
    json.minmem > pvsMemorySize){
      errFlg = true;
      errMsg += `PVS_MEMORY_SIZE[${pvsMemorySize}] must fall between ${json.minmem} and ${json.maxmem}. `;
  }
  if(json.maxproc < pvsCoreSize ||
    json.minproc > pvsCoreSize){
      errFlg = true;
      errMsg += `PVS_CORE_SIZE[${pvsCoreSize}] must fall between ${json.minproc} and ${json.maxproc}. `;
  }
  if(json.procType === 'dedicated'){
    if((pvsCoreSize*100 % 100) !== 0){
      errFlg = true;
      errMsg += `The dedicated CPU cannot be specified after the decimal point PVS_CORE_SIZE[${pvsCoreSize}]. `;
    }
  }
  if(errFlg){
    error('E308',`${errMsg}`)
  }
  if(json.processors === Number(pvsCoreSize) &&
  json.memory === Number(pvsMemorySize)){
    warn('W001', `PVS current resource size matches configured parameters.`)
    process.exit(0);
  }
}

const pvsUpdateResponseCheck = async (response) => {
  if(response.status !== 200 &&
    response.status !== 202){
    try{
      const fatalErrorMessage = 'Something fatal error occuered in update power virtual server instance resource.';
      const responseJson = await response.json();
      const errMsg = responseJson.message ? responseJson.message : ( responseJson.description ? responseJson.description : fatalErrorMessage);
      error('E105',`Response HTTP Status : ${response.status}. ${errMsg}`);
    }catch(err){
      logger.error(err);
      error('E905',`Response HTTP Status : ${response.status}. ${fatalErrorMessage}`);
    }
  }
}

const pvsUpdateInstanceJsonCheck = (json) => {
  if(json.processors === Number(pvsCoreSize) &&
  json.memory === Number(pvsMemorySize)){
    return true;
  }else{
    return false;
  }
}

(async() => {
  // Parameter Check
  requiredIsParamCheck();
  requiredParamFormatCheck();
  info('I000', `Parameter check finished`);
  info('I000', `Required Information : Target Instance [${pvsInstanceId}] Target Core Size [${pvsCoreSize}] Target Memory Size [${pvsMemorySize}]`);

  // Access token generate check
  const pvsGuid = pvsCrn.replace(/\:\:/,'').replace(/^.*\:/,'');
  const iamRequestUrl = `${iamEndpointUrl}?grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${pvsApikey}`
  const iamResponse = await fetch(iamRequestUrl, iamRequestOptions);
  await iamResponseCheck(iamResponse);
  const iamJson = await iamResponse.json();
  iamJsonCheck(iamJson);
  info('I000', `IAM response check finished`);

  const accessToken = iamJson.access_token;
  const pvsEndpointBaseUrl = `https://${pvsRegion}.power-iaas.cloud.ibm.com/pcloud/v1/cloud-instances/${pvsGuid}`;
  const pvsRequestOptions = {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'CRN': `${pvsCrn}`
    },
  }
  
  // PVS API Call Check
  const pvsBaseResponse = await fetch(pvsEndpointBaseUrl, pvsRequestOptions);
  await pvsBaseResponseCheck(pvsBaseResponse);
  info('I000', `PVS Reference Authorization check finished`);

  // PVS Instance exist Check
  const pvsEndpointInstancesUrl = `${pvsEndpointBaseUrl}/pvm-instances`;
  const pvsInstancesResponse = await fetch(pvsEndpointInstancesUrl, pvsRequestOptions);
  await pvsInstancesResponseCheck(pvsInstancesResponse);
  const pvsInstancesJson = await pvsInstancesResponse.json();
  pvsInstancesJsonCheck(pvsInstancesJson);
  info('I000', `PVS Instance Exist check finished`);

  // PVS Instance and Parameter Check
  const pvsEndpointInstanceUrl = `${pvsEndpointInstancesUrl}/${pvsInstanceId}`
  const pvsInstanceResponse = await fetch(pvsEndpointInstanceUrl, pvsRequestOptions);
  await pvsInstanceResponseCheck(pvsInstanceResponse);
  const pvsInstanceJson = await pvsInstanceResponse.json();
  pvsInstanceJsonCheck(pvsInstanceJson);
  info('I000', `Consistency check of Parameter and PVS Instance finished`);
  
  // PVS Instance Health Status Check
  const pvsCurrentStatus = pvsInstanceJson.health.status;
  if(pvsCurrentStatus !== 'OK'){
    warn('W000', `PVS Status is not OK. Current status is ${pvsCurrentStatus}`)
    let statusFlg = false;
    for(i=0; i<5; i++){
      await sleep(loopIntervalSecond);
      const loopPvsInstanceResponse = await fetch(pvsEndpointInstanceUrl, pvsRequestOptions);
      const loopPvsInstanceJson = await loopPvsInstanceResponse.json();
      const loopPvsStatus = loopPvsInstanceJson.health.status;
      if(loopPvsStatus === 'OK'){
        statusFlg = true;
        break;
      }
      warn('W000', `PVS Status is not OK. Current status is ${loopPvsStatus}`)
    }
    if(!statusFlg){
      error('E301',`Power Virtual Server instance status is not OK in ${loopIntervalSecond*5} seconds`);
    }
  }
  info('I000', `PVS Instance Status check finished`);

  // PVS Instance resource size change
  const pvsUpdateRequestOptions = {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'CRN': `${pvsCrn}`
    },
    body: `{"processors":${pvsCoreSize},"memory":${pvsMemorySize}}`
  }
  const pvsUpdateResponse = await fetch(pvsEndpointInstanceUrl, pvsUpdateRequestOptions);
  await pvsUpdateResponseCheck(pvsUpdateResponse);
  info('I000', `PVS Instance Resource Change is called`);
  info('I000', `Waiting for ${resourceChangeWaitSecond} seconds to Resource Change`);
  await sleep(resourceChangeWaitSecond);

  // PVS Changed Instance resource size check
  const pvsUpdatedInstanceResponse = await fetch(pvsEndpointInstanceUrl, pvsRequestOptions);
  await pvsInstanceResponseCheck(pvsUpdatedInstanceResponse);
  let pvsUpdatedInstanceJson = await pvsUpdatedInstanceResponse.json();
  let pvsUpdatedResourceCheckFlg = pvsUpdateInstanceJsonCheck(pvsUpdatedInstanceJson);
  if(!pvsUpdatedResourceCheckFlg){
    warn('W000', `PVS Resource Check is not OK. Current resource is Core size [${pvsUpdatedInstanceJson.processors}] Memory size [${pvsUpdatedInstanceJson.memory}]`);
    for(i=0; i<loopLimit; i++){
      info('I000', `Waiting for ${loopIntervalSecond} seconds to Resource Change`);
      await sleep(loopIntervalSecond);
      const loopPvsUpdatedInstanceResponse = await fetch(pvsEndpointInstanceUrl, pvsRequestOptions);
      await pvsInstanceResponseCheck(loopPvsUpdatedInstanceResponse);
      pvsUpdatedInstanceJson = await loopPvsUpdatedInstanceResponse.json();
      pvsUpdatedResourceCheckFlg = pvsUpdateInstanceJsonCheck(pvsUpdatedInstanceJson);
      if(pvsUpdatedResourceCheckFlg){
        break;
      }
      warn('W000', `PVS Resource Check is not OK. Current resource is Core size [${pvsUpdatedInstanceJson.processors}] Memory size [${pvsUpdatedInstanceJson.memory}]`);
    }
    if(!pvsUpdatedResourceCheckFlg){
      error('E302',`Power Virtual Server instance is not affected request parameter in ${loopLimit*loopIntervalSecond + apiWaitSecond} seconds`);
    }
  }
  info('I000', `PVS Instance Resource Change is finished. Current resource is Core size [${pvsUpdatedInstanceJson.processors}] Memory size [${pvsUpdatedInstanceJson.memory}]`);
})();
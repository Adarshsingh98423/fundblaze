const svc = require('../services/donation.service');
const { sendSuccess } = require('../utils/response.utils');

exports.create        = async (req,res,next) => { try { sendSuccess(res, await svc.create(req.body,req.user?._id),'Donation successful',201); } catch(e){next(e);} };
exports.getByCampaign = async (req,res,next) => { try { sendSuccess(res, await svc.getByCampaign(req.params.campaignId,req.query));            } catch(e){next(e);} };
exports.getMine       = async (req,res,next) => { try { sendSuccess(res, await svc.getMine(req.user._id,req.query));                           } catch(e){next(e);} };

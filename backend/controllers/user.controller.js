const userSvc  = require('../services/user.service');
const statsSvc = require('../services/stats.service');
const { sendSuccess } = require('../utils/response.utils');

exports.getProfile  = async (req,res,next) => { try { sendSuccess(res, await userSvc.getPublicProfile(req.params.id));     } catch(e){next(e);} };
exports.updateMe    = async (req,res,next) => { try { sendSuccess(res, await userSvc.updateMe(req.user._id,req.body),'Profile updated'); } catch(e){next(e);} };
exports.getMyStats  = async (req,res,next) => { try { sendSuccess(res, await statsSvc.getDashboardStats(req.user._id));    } catch(e){next(e);} };

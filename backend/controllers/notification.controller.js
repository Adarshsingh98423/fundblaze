const svc = require('../services/notification.service');
const { sendSuccess } = require('../utils/response.utils');

exports.getAll      = async (req,res,next) => { try { sendSuccess(res, await svc.getAll(req.user._id,req.query));         } catch(e){next(e);} };
exports.markRead    = async (req,res,next) => { try { sendSuccess(res, await svc.markRead(req.params.id,req.user._id),'Marked as read'); } catch(e){next(e);} };
exports.markAllRead = async (req,res,next) => { try { await svc.markAllRead(req.user._id); sendSuccess(res,null,'All marked as read');   } catch(e){next(e);} };

const svc = require('../services/campaign.service');
const { sendSuccess } = require('../utils/response.utils');

exports.getAll     = async (req,res,next) => { try { sendSuccess(res, await svc.getCampaigns(req.query));                                   } catch(e){next(e);} };
exports.getTrending= async (req,res,next) => { try { sendSuccess(res, await svc.getTrending());                                             } catch(e){next(e);} };
exports.getBySlug  = async (req,res,next) => { try { sendSuccess(res, await svc.getBySlug(req.params.slug));                                } catch(e){next(e);} };
exports.create     = async (req,res,next) => { try { sendSuccess(res, await svc.create(req.body,req.user._id),'Campaign created',201);      } catch(e){next(e);} };
exports.update     = async (req,res,next) => { try { sendSuccess(res, await svc.update(req.params.id,req.body,req.user._id,req.user.role)); } catch(e){next(e);} };
exports.remove     = async (req,res,next) => { try { await svc.remove(req.params.id,req.user._id,req.user.role); sendSuccess(res,null,'Campaign deleted'); } catch(e){next(e);} };
exports.getMine    = async (req,res,next) => { try { sendSuccess(res, await svc.getMine(req.user._id));                                     } catch(e){next(e);} };

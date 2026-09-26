require('dotenv').config({ path: require('path').join(__dirname,'../.env') });
const mongoose = require('mongoose');
const User     = require('../models/User');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const { Notification } = require('../models/Transaction');

const URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fundblaze';
const day = (n) => new Date(Date.now() + n*86400000);

// ── Seed data ────────────────────────────────────────────────────────────────
const USERS = [
  { name:'Aarav Sharma',   username:'aarav_sharma',   email:'aarav@fundblaze.com',   password:'password123', role:'creator',
    bio:'Renewable energy engineer with 10 years of field experience across rural India.', verified:true,
    avatar:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    stats:{ totalRaised:2800000, activeCampaigns:2, totalDonors:1200, campaignsBacked:0 } },
  { name:'Priya Patel',    username:'priya_patel',    email:'priya@fundblaze.com',    password:'password123', role:'creator',
    bio:'Environmental engineer and social activist focused on water sanitation.', verified:true,
    avatar:'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&q=80',
    stats:{ totalRaised:4200000, activeCampaigns:2, totalDonors:1800, campaignsBacked:0 } },
  { name:'Rohan Mehta',    username:'rohan_mehta',    email:'rohan@fundblaze.com',    password:'password123', role:'creator',
    bio:'Community organiser and arts advocate based in Mumbai.', verified:true,
    avatar:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    stats:{ totalRaised:1500000, activeCampaigns:1, totalDonors:600, campaignsBacked:0 } },
  { name:'Ananya Iyer',    username:'ananya_iyer',    email:'ananya@fundblaze.com',   password:'password123', role:'creator',
    bio:'Medical professional and healthcare access advocate.', verified:false,
    avatar:'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    stats:{ totalRaised:800000, activeCampaigns:1, totalDonors:400, campaignsBacked:0 } },
  { name:'Test Donor',     username:'test_donor',     email:'donor@fundblaze.com',    password:'password123', role:'donor',
    bio:'Supporting impactful campaigns across India.', verified:true,
    stats:{ totalRaised:0, activeCampaigns:0, totalDonors:0, campaignsBacked:8 } },
  { name:'Admin User',     username:'admin_fundblaze',email:'admin@fundblaze.com',    password:'admin1234',   role:'admin',
    bio:'FundBlaze platform administrator.', verified:true },
];

const makeCampaigns = (u) => [
  {
    title:'SolarGrid: Portable Power for Off-Grid Rural Communities',
    shortDescription:'Bringing renewable solar energy to 50 villages in Rajasthan with portable, affordable solar units.',
    story:`<h2>The Problem</h2><p>Over 300 million Indians still lack reliable electricity. Rural Rajasthan families rely on kerosene lamps that cost more per lumen than grid power and cause severe respiratory illness.</p><h2>Our Solution</h2><p>SolarGrid is a modular solar unit deployable in under 2 hours. Each unit powers a home for a month from a single day of sunlight.</p><h2>Fund Allocation</h2><p>200 solar units (₹9,00,000) · Installation training (₹2,00,000) · 12-month maintenance (₹50,000)</p><h2>Impact Tracking</h2><p>Every unit is IoT-tracked. We publish monthly transparency reports with photos and watt-hour data.</p>`,
    creator:u[0]._id, category:'Technology',
    tags:['solar','renewable energy','rural','sustainability','rajasthan'],
    goalAmount:1100000, raisedAmount:450000, donorCount:342,
    deadline:day(14), status:'active', isFeatured:true, trendScore:85,
    coverImage:'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
    location:'Rajasthan, India', minDonation:100,
    rewardTiers:[
      { title:'Supporter',        amount:500,  description:'Digital certificate + project updates',               maxClaims:1000, claimedCount:289 },
      { title:'Village Champion', amount:5000, description:'Sponsor one solar unit · your name on it · monthly reports', maxClaims:200, claimedCount:47  },
    ],
    updates:[{ title:'First 50 units deployed! 🌞', content:'We successfully deployed the first batch of 50 solar units across 5 villages in Barmer district. 250 families now have clean light after sunset.' }],
  },
  {
    title:'Clean Water Initiative: Bio-Filters for 30 Schools in Odisha',
    shortDescription:'Installing low-cost bio-sand water filters in 30 schools to provide safe drinking water for 4,500 students.',
    story:`<h2>The Crisis</h2><p>In rural Odisha, over 60% of government schools lack clean drinking water. Waterborne diseases cause chronic absenteeism and learning delays.</p><h2>Our Solution</h2><p>Our bio-sand filters use locally sourced materials. Cost: ₹15,000 per filter. Serves 150 students for 10+ years with zero recurring cost.</p><h2>Pilot Results</h2><p>8 filters already installed. School attendance improved by 23% in pilot villages.</p>`,
    creator:u[1]._id, category:'Environment',
    tags:['water','education','health','odisha','sanitation'],
    goalAmount:500000, raisedAmount:485000, donorCount:891,
    deadline:day(5), status:'active', isFeatured:true, trendScore:92,
    coverImage:'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=800&q=80',
    location:'Odisha, India', minDonation:100,
    rewardTiers:[
      { title:'Filter Friend', amount:1000, description:'Fund one filter component + receive a digital impact badge', maxClaims:500, claimedCount:312 },
    ],
    updates:[],
  },
  {
    title:'Canvas of Hope: Community Arts Centre in Dharavi, Mumbai',
    shortDescription:'Building a free creative space for 500+ underprivileged youth to explore art, music, and digital skills each year.',
    story:`<h2>Why Art Matters</h2><p>Dharavi is home to over 1 million people yet has zero dedicated arts spaces for youth. Creative expression builds confidence, critical thinking, and career options.</p><h2>What We'll Build</h2><p>A 3,000 sq ft community centre offering free workshops in visual arts, music production, photography, and graphic design. Open 6 days a week.</p>`,
    creator:u[2]._id, category:'Arts',
    tags:['arts','youth','education','community','mumbai','dharavi'],
    goalAmount:800000, raisedAmount:320000, donorCount:215,
    deadline:day(30), status:'active', isFeatured:false, trendScore:60,
    coverImage:'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80',
    location:'Mumbai, India', minDonation:200,
    rewardTiers:[
      { title:'Art Patron',    amount:1000,  description:'Your name on the donors wall + exclusive art print by a student artist', maxClaims:300, claimedCount:98 },
      { title:'Studio Sponsor',amount:10000, description:'Sponsor a full workshop session (50 students, 4 hours)',                 maxClaims:50,  claimedCount:12 },
    ],
    updates:[],
  },
  {
    title:'Mobile Medical Unit for Tribal Belt of Jharkhand',
    shortDescription:'Deploying two fully equipped mobile clinics to serve 80 remote tribal villages with zero healthcare access.',
    story:`<h2>The Healthcare Gap</h2><p>In Jharkhand's tribal belt the nearest hospital is often 4–6 hours away on foot. Maternal mortality is 3× the national average.</p><h2>Our Fleet</h2><p>Each mobile unit carries a doctor, nurse, diagnostic equipment, and a 3-month medicine supply. Fixed weekly schedules so villagers can plan.</p>`,
    creator:u[3]._id, category:'Medical',
    tags:['healthcare','tribal','rural','jharkhand','mobile clinic'],
    goalAmount:1500000, raisedAmount:620000, donorCount:450,
    deadline:day(45), status:'active', isFeatured:true, trendScore:70,
    coverImage:'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=800&q=80',
    location:'Jharkhand, India', minDonation:100,
    rewardTiers:[
      { title:'Healthcare Hero', amount:2000, description:'Certificate + quarterly impact reports + name in annual health report', maxClaims:500, claimedCount:180 },
    ],
    updates:[],
  },
  {
    title:'Digital Classrooms for 50 Government Schools in Bihar',
    shortDescription:'Equipping 50 government schools with tablets, projectors, and solar internet for 15,000 students.',
    story:`<h2>Bridging the Digital Divide</h2><p>Bihar's government schools serve millions of children who will be left behind in India's digital economy without access to modern learning tools.</p><h2>What ₹20 Lakh Will Do</h2><p>50 schools × 30 tablets + 1 projector + solar-powered internet + 6 months of teacher training + offline content library covering grades 6–10.</p>`,
    creator:u[0]._id, category:'Education',
    tags:['education','digital','schools','bihar','technology'],
    goalAmount:2000000, raisedAmount:2000000, donorCount:1203,
    deadline:day(-10), status:'funded', isFeatured:false, trendScore:95,
    coverImage:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
    location:'Bihar, India', minDonation:100, rewardTiers:[],
    updates:[
      { title:'🎉 FULLY FUNDED!', content:'We are overwhelmed by your generosity. All 50 schools will be equipped within the next 60 days. Follow our social channels for deployment photos!' },
    ],
  },
  {
    title:'Seed Bank for 200 Farmers: Organic Farming in Karnataka',
    shortDescription:'Creating a community seed bank and training programme to help 200 small farmers transition to profitable organic farming.',
    story:`<h2>Breaking the Debt Cycle</h2><p>Small farmers in Karnataka spend 40% of their income on hybrid seeds and chemical fertilisers each season. Our seed bank stores 300+ heirloom varieties free for member farmers.</p><h2>Training Programme</h2><p>12-month certification in organic farming, composting, and direct-to-consumer sales. First cohort of 40 farmers completed pilot with 28% income increase.</p>`,
    creator:u[1]._id, category:'Community',
    tags:['farming','organic','sustainability','karnataka','seeds'],
    goalAmount:600000, raisedAmount:95000, donorCount:87,
    deadline:day(60), status:'active', isFeatured:false, trendScore:35,
    coverImage:'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
    location:'Karnataka, India', minDonation:100,
    rewardTiers:[
      { title:'Seed Saver', amount:500, description:'Receive a curated packet of 5 heirloom seed varieties by post', maxClaims:500, claimedCount:45 },
    ],
    updates:[],
  },
];

const makeDonations = (camps, donor) => [
  { campaign:camps[0]._id, donor:donor._id, amount:500,  currency:'INR', gateway:'manual', status:'completed', anonymous:false, message:'Keep up the amazing work!',      paymentMethod:'upi'        },
  { campaign:camps[1]._id, donor:donor._id, amount:1000, currency:'INR', gateway:'manual', status:'completed', anonymous:false, message:'This is such a great cause.',    paymentMethod:'card'       },
  { campaign:camps[2]._id, donor:donor._id, amount:2000, currency:'INR', gateway:'manual', status:'completed', anonymous:true,  message:'',                               paymentMethod:'card'       },
  { campaign:camps[3]._id, donor:donor._id, amount:5000, currency:'INR', gateway:'manual', status:'completed', anonymous:false, message:'Donating for a better India. 🇮🇳', paymentMethod:'netbanking' },
];

// ── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(URI);
    console.log('✅ Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}), Campaign.deleteMany({}),
      Donation.deleteMany({}), Notification.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create users (triggers bcrypt pre-save hook)
    const users = [];
    for (const u of USERS) { users.push(await User.create(u)); }
    console.log(`👥 Created ${users.length} users`);

    // Campaigns (slug auto-generated by pre-save)
    const campaigns = await Campaign.insertMany(makeCampaigns(users));
    console.log(`🚀 Created ${campaigns.length} campaigns`);

    // Donations
    const donations = await Donation.insertMany(makeDonations(campaigns, users[4]));
    console.log(`💰 Created ${donations.length} donations`);

    // Notifications
    await Notification.insertMany([
      { user:users[0]._id, type:'donation_received', title:'New Donation Received! 🎉',
        message:'A donor contributed ₹5,000 to your campaign "SolarGrid"', isRead:false,
        metadata:{ campaignId:campaigns[0]._id.toString() } },
      { user:users[0]._id, type:'campaign_funded', title:'🏆 Campaign Fully Funded!',
        message:'Your campaign "Digital Classrooms for 50 Government Schools" has reached its goal!', isRead:true,
        metadata:{ campaignId:campaigns[4]._id.toString() } },
      { user:users[1]._id, type:'donation_received', title:'New Donation Received! 🎉',
        message:'A donor contributed ₹1,000 to your campaign "Clean Water Initiative"', isRead:false,
        metadata:{ campaignId:campaigns[1]._id.toString() } },
    ]);
    console.log('🔔 Created notifications');

    console.log('\n🎉 Seed complete!\n');
    console.log('┌──────────┬──────────────────────────────┬──────────────┐');
    console.log('│ Role     │ Email                        │ Password     │');
    console.log('├──────────┼──────────────────────────────┼──────────────┤');
    USERS.forEach(u =>
      console.log(`│ ${u.role.padEnd(8)} │ ${u.email.padEnd(28)} │ ${u.password.padEnd(12)} │`)
    );
    console.log('└──────────┴──────────────────────────────┴──────────────┘');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected');
  }
}

seed();

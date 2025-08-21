import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!

    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const formData = await req.json()
    
    // Store in database
    const { error: dbError } = await supabase
      .from('fibre_feasibility_assessments')
      .insert({
        contact_name: formData.contactName,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        area_name: formData.areaName,
        assessment_data: formData,
        score: formData.score,
        recommendation: formData.recommendation,
        submitted_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to store assessment data')
    }

    // Prepare scoring breakdown
    const scoreBreakdown = generateScoreBreakdown(formData)
    
    // Generate HTML email
    const htmlContent = generateEmailHTML(formData, scoreBreakdown)
    
    // Send email notification
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'assessments@siyakhatechnology.co.za',
        to: ['nikita@siyakhatechnology.co.za'],
        subject: `Fibre Feasibility Assessment - ${formData.areaName} (Score: ${formData.score}/100)`,
        html: htmlContent,
      }),
    })

    if (!emailRes.ok) {
      const errorText = await emailRes.text()
      console.error('Email send error:', errorText)
      throw new Error('Failed to send email notification')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Assessment submitted successfully',
        score: formData.score,
        recommendation: formData.recommendation
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function generateScoreBreakdown(data: any) {
  const breakdown = {
    demand: 0,
    competition: 0,
    technical: 0,
    permissions: 0,
    financials: 0,
    operations: 0
  }

  // Demand & Revenue (25%)
  let demandScore = 0
  if (data.serviceablePremises >= 500) demandScore += 25
  else if (data.serviceablePremises >= 200) demandScore += 20
  else if (data.serviceablePremises >= 100) demandScore += 15
  else demandScore += 10
  
  if (data.densityPerKm >= 50) demandScore += 25
  else if (data.densityPerKm >= 30) demandScore += 20
  else if (data.densityPerKm >= 15) demandScore += 15
  else demandScore += 10
  
  if (data.takeRate24Months >= 40) demandScore += 25
  else if (data.takeRate24Months >= 30) demandScore += 20
  else if (data.takeRate24Months >= 20) demandScore += 15
  else demandScore += 10
  
  if (data.expectedARPU >= 600) demandScore += 25
  else if (data.expectedARPU >= 400) demandScore += 20
  else if (data.expectedARPU >= 300) demandScore += 15
  else demandScore += 10
  
  breakdown.demand = Math.round((demandScore / 4) * 0.25 * 100)

  // Competition (15%)
  let competitionScore = 0
  if (data.competitorBuilds === "none") competitionScore += 100
  else if (data.competitorBuilds === "planned") competitionScore += 60
  else competitionScore += 20
  
  breakdown.competition = Math.round(competitionScore * 0.15)

  // Technical (15%)
  let techScore = 0
  const backhaul = { excellent: 100, good: 80, fair: 60, poor: 30 }
  techScore += backhaul[data.backhaul] * 0.4
  
  const complexity = { low: 100, medium: 70, high: 40 }
  techScore += complexity[data.civilComplexity] * 0.3
  
  const power = { stable: 100, intermittent: 60, unreliable: 30 }
  techScore += power[data.powerAvailability] * 0.3
  
  breakdown.technical = Math.round(techScore * 0.15)

  // Permissions (10%)
  let permissionsScore = 0
  const municipal = { supportive: 100, neutral: 70, resistant: 30 }
  permissionsScore += municipal[data.municipalStance] * 0.4
  
  const hoa = { signed: 100, pending: 60, none: 20 }
  permissionsScore += hoa[data.hoaAgreements] * 0.6
  
  breakdown.permissions = Math.round(permissionsScore * 0.10)

  // Financials (15%)
  let financialScore = 0
  if (data.paybackPeriod <= 24) financialScore += 100
  else if (data.paybackPeriod <= 36) financialScore += 80
  else if (data.paybackPeriod <= 48) financialScore += 60
  else financialScore += 30
  
  const security = { low: 100, medium: 70, high: 40 }
  financialScore = (financialScore + security[data.securityRisk]) / 2
  
  breakdown.financials = Math.round(financialScore * 0.15)

  // Operations (5%)
  let opsScore = 0
  const contractors = { available: 100, limited: 60, none: 20 }
  opsScore += contractors[data.localContractors] * 0.6
  
  const capacity = { high: 100, medium: 70, low: 40 }
  opsScore += capacity[data.installCapacity] * 0.4
  
  breakdown.operations = Math.round(opsScore * 0.05)

  return breakdown
}

function generateEmailHTML(data: any, breakdown: any) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return '#16a34a' // green
    if (score >= 50) return '#eab308' // yellow
    return '#dc2626' // red
  }

  const formatCurrency = (amount: number) => `R${amount.toLocaleString()}`

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Fibre Feasibility Assessment</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: #1a365d; color: white; padding: 20px; text-align: center; }
        .score-card { background: #f8f9fa; border: 2px solid ${getScoreColor(data.score)}; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .score-number { font-size: 48px; font-weight: bold; color: ${getScoreColor(data.score)}; }
        .recommendation { background: ${data.score >= 75 ? '#dcfce7' : '#fef2f2'}; color: ${data.score >= 75 ? '#166534' : '#991b1b'}; padding: 10px; border-radius: 4px; font-weight: bold; text-align: center; margin: 10px 0; }
        .section { margin: 20px 0; padding: 15px; border-left: 4px solid #3b82f6; background: #f8fafc; }
        .breakdown { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .breakdown-item { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .breakdown-score { font-size: 24px; font-weight: bold; color: #3b82f6; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; margin-top: 30px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Fibre Feasibility Assessment</h1>
            <p>Comprehensive Analysis for ${data.areaName}</p>
        </div>

        <div class="score-card">
            <div class="score-number">${data.score}/100</div>
            <p>Overall Feasibility Score</p>
            <div class="recommendation">
                ${data.recommendation === 'GO' ? '✅ RECOMMENDED FOR BUILD' : '⚠️ REQUIRES FURTHER REVIEW'}
            </div>
        </div>

        <div class="section">
            <h2>Executive Summary</h2>
            <p><strong>Area:</strong> ${data.areaName}</p>
            <p><strong>Contact:</strong> ${data.contactName} (${data.company})</p>
            <p><strong>Assessment Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Serviceable Premises:</strong> ${data.serviceablePremises}</p>
            <p><strong>Projected 24-month Take Rate:</strong> ${data.takeRate24Months}%</p>
            <p><strong>Expected ARPU:</strong> ${formatCurrency(data.expectedARPU)}</p>
            <p><strong>Payback Period:</strong> ${data.paybackPeriod} months</p>
        </div>

        <div class="section">
            <h2>Score Breakdown</h2>
            <div class="breakdown">
                <div class="breakdown-item">
                    <div class="breakdown-score">${breakdown.demand}</div>
                    <p>Demand & Revenue (25%)</p>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-score">${breakdown.competition}</div>
                    <p>Competition (15%)</p>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-score">${breakdown.technical}</div>
                    <p>Technical (15%)</p>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-score">${breakdown.permissions}</div>
                    <p>Permissions (10%)</p>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-score">${breakdown.financials}</div>
                    <p>Financials (15%)</p>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-score">${breakdown.operations}</div>
                    <p>Operations (5%)</p>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Detailed Assessment Data</h2>
            
            <h3>Market Analysis</h3>
            <table>
                <tr><th>Metric</th><th>Value</th></tr>
                <tr><td>Serviceable Premises</td><td>${data.serviceablePremises}</td></tr>
                <tr><td>Density per km</td><td>${data.densityPerKm}</td></tr>
                <tr><td>Take Rate (6/12/24 months)</td><td>${data.takeRate6Months}% / ${data.takeRate12Months}% / ${data.takeRate24Months}%</td></tr>
                <tr><td>Expected ARPU</td><td>${formatCurrency(data.expectedARPU)}</td></tr>
                <tr><td>Price Sensitivity</td><td>${data.priceSensitivity}</td></tr>
            </table>

            <h3>Technical Infrastructure</h3>
            <table>
                <tr><th>Component</th><th>Status</th></tr>
                <tr><td>Backhaul Access</td><td>${data.backhaul}</td></tr>
                <tr><td>Civil Complexity</td><td>${data.civilComplexity}</td></tr>
                <tr><td>Power Availability</td><td>${data.powerAvailability}</td></tr>
                <tr><td>Topology Type</td><td>${data.topologyType}</td></tr>
                <tr><td>Average Drop Length</td><td>${data.averageDropLength}m</td></tr>
            </table>

            <h3>Financial Projections</h3>
            <table>
                <tr><th>Item</th><th>Amount</th></tr>
                <tr><td>CAPEX per Home Passed</td><td>${formatCurrency(data.capexPerHP)}</td></tr>
                <tr><td>CAPEX per Connected Home</td><td>${formatCurrency(data.capexPerConnected)}</td></tr>
                <tr><td>Monthly OPEX</td><td>${formatCurrency(data.monthlyOpex)}</td></tr>
                <tr><td>Payback Period</td><td>${data.paybackPeriod} months</td></tr>
                <tr><td>Security Risk Level</td><td>${data.securityRisk}</td></tr>
            </table>

            <h3>Permissions & Approvals</h3>
            <table>
                <tr><th>Authority</th><th>Status</th></tr>
                <tr><td>Municipal Stance</td><td>${data.municipalStance}</td></tr>
                <tr><td>HOA Agreements</td><td>${data.hoaAgreements}</td></tr>
                <tr><td>Wayleave Status</td><td>${data.wayleaveStatus}</td></tr>
            </table>
        </div>

        <div class="section">
            <h2>Market Context</h2>
            <p><strong>Existing Providers:</strong></p>
            <p>${data.existingProviders}</p>
            
            <p><strong>Competitor Build Status:</strong> ${data.competitorBuilds}</p>
            
            <p><strong>Differentiation Strategy:</strong></p>
            <p>${data.differentiationStrategy}</p>
            
            <p><strong>Verified Demand:</strong></p>
            <p>${data.verifiedDemand}</p>
        </div>

        ${data.additionalNotes ? `
        <div class="section">
            <h2>Additional Notes</h2>
            <p>${data.additionalNotes}</p>
        </div>
        ` : ''}

        <div class="section">
            <h2>Recommendation</h2>
            ${data.score >= 75 && data.paybackPeriod <= 36 ? `
                <p style="color: #16a34a; font-weight: bold;">✅ PROCEED WITH BUILD</p>
                <p>This area shows strong feasibility indicators with a composite score of ${data.score}/100 and payback period of ${data.paybackPeriod} months. Recommended next steps:</p>
                <ul>
                    <li>Finalize wayleave and permission agreements</li>
                    <li>Secure ISP partnerships and commit agreements</li>
                    <li>Conduct detailed site survey</li>
                    <li>Prepare final business case and funding proposal</li>
                </ul>
            ` : `
                <p style="color: #dc2626; font-weight: bold;">⚠️ FURTHER REVIEW REQUIRED</p>
                <p>This area requires additional analysis before proceeding. Key concerns:</p>
                <ul>
                    ${data.score < 75 ? '<li>Overall feasibility score below threshold (75)</li>' : ''}
                    ${data.paybackPeriod > 36 ? '<li>Payback period exceeds 36 months</li>' : ''}
                    <li>Consider strategies to improve take-rate and reduce costs</li>
                    <li>Explore partnerships or phased rollout approaches</li>
                </ul>
            `}
        </div>

        <div class="footer">
            <p><strong>Siyakha Technology Solutions</strong></p>
            <p>Fibre Network Planning & Deployment</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`
}

/* SQL to create table:
CREATE TABLE IF NOT EXISTS fibre_feasibility_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_name TEXT NOT NULL,
    company TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    area_name TEXT NOT NULL,
    assessment_data JSONB NOT NULL,
    score INTEGER NOT NULL,
    recommendation TEXT NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE fibre_feasibility_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assessments are viewable by authenticated users" 
ON fibre_feasibility_assessments FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Assessments can be inserted by anyone" 
ON fibre_feasibility_assessments FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);
*/
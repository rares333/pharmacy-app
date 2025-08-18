const { Pool } = require('pg');

const ALL_CATEGORIES = [
  "Aminoacizi",
  "Analgezice antipiretice",
  "Analgezice opioide",
  "Anestezice generale",
  "Anestezice locale",
  "Antiacide",
  "Antiagregante plachetare",
  "Antianginoase",
  "Antiaritmice",
  "Antiastmatice",
  "Antibiotice",
  "Anticoagulante",
  "Anticolinergice bronhodilatatoare",
  "Anticolinergice urinare",
  "Anticonceptionale",
  "Anticonvulsivante (Antiepileptice)",
  "Anticorpi monoclonali",
  "Antidepresive",
  "Antidiabetice orale",
  "Antidiareice",
  "Antiglaucomatoase",
  "Antihemoroidale",
  "Antihipertensive",
  "Antihistaminice",
  "Antiinflamatoare nesteroidiene",
  "Antimicotice",
  "Antimigrenoase",
  "Antineoplazice",
  "Antiosteoporotice",
  "Antipsihotice",
  "Antireumatice specifice",
  "Antiseptice",
  "Antispastice",
  "Antispastice urinare",
  "Antitusive",
  "Antivirale",
  "Benzodiazepine",
  "Bifidobacterii",
  "Bronhodilatatoare",
  "Bronhodilatatoare musculotrope",
  "Bronhodilatatoare parasimaptolitice",
  "Complex de Vitamine B",
  "Corticosteroizi topici",
  "Diuretice",
  "Enzime digestive",
  "Expectorante secretostimulante",
  "Extracte alergenice",
  "Glicozide cadriotonice",
  "Glucocorticoizi sistemici",
  "Hipnotice si sedative",
  "Hipolipemiante",
  "Homeopate",
  "Hormoni",
  "Imunoglobuline",
  "Imunomodulatoare",
  "Imunosupresoare",
  "Inhibitori",
  "Insuline",
  "Lactobacili",
  "Laxative",
  "Medicamente antiretrovirale",
  "Medicamente beta-blocante",
  "Medicamente blocante ale canalelor de calciu",
  "Medicamente prokinetice",
  "Medicația antiemetică (Antivomitive)",
  "Minerale",
  "Mucolitice",
  "Nootropice",
  "Peniciline",
  "Preparate fitoterapice",
  "Probiotice",
  "Retinoizi topici",
  "Sartani",
  "Simpatomimetice",
  "Spermicide",
  "Substanțe de contrast",
  "Sulfonamide antibacteriene",
  "Vaccinuri",
  "Vitamine",
];

// 82 regex → category rules
const KEYWORD_MAP = [
  { re: /\b(aminoacid|aminoacizi)\b/i,                 cat: "Aminoacizi" },
  { re: /\b(analgezic|antipiretic|durere)\b/i,          cat: "Analgezice antipiretice" },
  { re: /\b(opioid)\b/i,                               cat: "Analgezice opioide" },
  { re: /\b(anestezic( general)?|anestezie)\b/i,       cat: "Anestezice generale" },
  { re: /\b(anestezic local)\b/i,                      cat: "Anestezice locale" },
  { re: /\b(antacid(e)?)\b/i,                          cat: "Antiacide" },
  { re: /\b(antiagregant(e)?)\b/i,                     cat: "Antiagregante plachetare" },
  { re: /\b(antianginos)\b/i,                          cat: "Antianginoase" },
  { re: /\b(antiaritmic)\b/i,                          cat: "Antiaritmice" },
  { re: /\b(antiasmatic|astmatic)\b/i,                 cat: "Antiastmatice" },
  { re: /\b(antibiotic)\b/i,                           cat: "Antibiotice" },
  { re: /\b(anticoagulant)\b/i,                        cat: "Anticoagulante" },
  { re: /\b(bronhodilatator|anticolinergic)\b/i,       cat: "Anticolinergice bronhodilatatoare" },
  { re: /\b(urinare|antispastic urinar)\b/i,           cat: "Antispastice urinare" },
  { re: /\b(contraceptiv)\b/i,                         cat: "Anticonceptionale" },
  { re: /\b(convulsivant|antiepileptic)\b/i,           cat: "Anticonvulsivante (Antiepileptice)" },
  { re: /\b(anticorp)\b/i,                             cat: "Anticorpi monoclonali" },
  { re: /\b(antidepresiv)\b/i,                         cat: "Antidepresive" },
  { re: /\b(diabet)\b/i,                               cat: "Antidiabetice orale" },
  { re: /\b(diare)\b/i,                                cat: "Antidiareice" },
  { re: /\b(glaucom)\b/i,                              cat: "Antiglaucomatoase" },
  { re: /\b(hemoroid)\b/i,                             cat: "Antihemoroidale" },
  { re: /\b(hipertensiv)\b/i,                          cat: "Antihipertensive" },
  { re: /\b(antihistaminic)\b/i,                       cat: "Antihistaminice" },
  { re: /\b(antiinflamator)\b/i,                       cat: "Antiinflamatoare nesteroidiene" },
  { re: /\b(fungicid|antimicot)\b/i,                   cat: "Antimicotice" },
  { re: /\b(migrena|migrenoase)\b/i,                   cat: "Antimigrenoase" },
  { re: /\b(neoplazic|cancer)\b/i,                     cat: "Antineoplazice" },
  { re: /\b(osteopor)\b/i,                             cat: "Antiosteoporotice" },
  { re: /\b(psihot|schizofren)\b/i,                    cat: "Antipsihotice" },
  { re: /\b(reumatic|reumatism)\b/i,                   cat: "Antireumatice specifice" },
  { re: /\b(antiseptic)\b/i,                           cat: "Antiseptice" },
  { re: /\b(spasm|spasmolitic)\b/i,                    cat: "Antispastice" },
  { re: /\b(antitusi(v)?)\b/i,                         cat: "Antitusive" },
  { re: /\b(antiviral)\b/i,                            cat: "Antivirale" },
  { re: /\b(diazepam|lorazepam|alprazolam|midazolam)\b/i, cat: "Benzodiazepine" },
  { re: /\b(bifidobacteri)\b/i,                        cat: "Bifidobacterii" },
  { re: /\b(bronhodilatator)\b/i,                      cat: "Bronhodilatatoare" },
  { re: /\b(musculotrop)\b/i,                          cat: "Bronhodilatatoare musculotrope" },
  { re: /\b(parasimpatolitic)\b/i,                     cat: "Bronhodilatatoare parasimaptolitice" },
  { re: /\b(vitamine b)\b/i,                           cat: "Complex de Vitamine B" },
  { re: /\b(corticosteroid)\b/i,                       cat: "Corticosteroizi topici" },
  { re: /\b(diuretic)\b/i,                             cat: "Diuretice" },
  { re: /\b(enzim)\b/i,                                cat: "Enzime digestive" },
  { re: /\b(expectorant)\b/i,                          cat: "Expectorante secretostimulante" },
  { re: /\b(alergenic)\b/i,                            cat: "Extracte alergenice" },
  { re: /\b(cardiotonic)\b/i,                          cat: "Glicozide cadriotonice" },
  { re: /\b(glucocorticoid)\b/i,                       cat: "Glucocorticoizi sistemici" },
  { re: /\b(hipnotice|sedativ)\b/i,                    cat: "Hipnotice si sedative" },
  { re: /\b(hipolipemiant)\b/i,                        cat: "Hipolipemiante" },
  { re: /\b(homeopat)\b/i,                             cat: "Homeopate" },
  { re: /\b(hormon)\b/i,                               cat: "Hormoni" },
  { re: /\b(imunoglobulin)\b/i,                        cat: "Imunoglobuline" },
  { re: /\b(imunomodul)\b/i,                           cat: "Imunomodulatoare" },
  { re: /\b(imunosupres)\b/i,                          cat: "Imunosupresoare" },
  { re: /\b(inhibitor)\b/i,                            cat: "Inhibitori" },
  { re: /\b(insulin)\b/i,                              cat: "Insuline" },
  { re: /\b(lactobacil)\b/i,                           cat: "Lactobacili" },
  { re: /\b(laxativ)\b/i,                              cat: "Laxative" },
  { re: /\b(antiretroviral)\b/i,                       cat: "Medicamente antiretrovirale" },
  { re: /\b(beta[- ]blocant)\b/i,                      cat: "Medicamente beta-blocante" },
  { re: /\b(calciu|blocant canal)\b/i,                  cat: "Medicamente blocante ale canalelor de calciu" },
  { re: /\b(prokinetic)\b/i,                           cat: "Medicamente prokinetice" },
  { re: /\b(antiemetic|antivomitiv)\b/i,               cat: "Medicația antiemetică (Antivomitive)" },
  { re: /\b(mineral)\b/i,                              cat: "Minerale" },
  { re: /\b(mucolitic)\b/i,                            cat: "Mucolitice" },
  { re: /\b(nootropic)\b/i,                            cat: "Nootropice" },
  { re: /\b(penicilin)\b/i,                            cat: "Peniciline" },
  { re: /\b(fitoterapic)\b/i,                          cat: "Preparate fitoterapice" },
  { re: /\b(probiotic)\b/i,                            cat: "Probiotice" },
  { re: /\b(retinoid)\b/i,                             cat: "Retinoizi topici" },
  { re: /\b(sartan)\b/i,                               cat: "Sartani" },
  { re: /\b(simpatomimetic)\b/i,                       cat: "Simpatomimetice" },
  { re: /\b(spermicid)\b/i,                            cat: "Spermicide" },
  { re: /\b(contrast)\b/i,                             cat: "Substanțe de contrast" },
  { re: /\b(sulfonamid)\b/i,                           cat: "Sulfonamide antibacteriene" },
  { re: /\b(vaccin)\b/i,                               cat: "Vaccinuri" },
  { re: /\b(vitamin)\b/i,                              cat: "Vitamine" },
];

async function main() {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      'postgresql://pharmacy_user:1234@localhost:5432/pharmacy'
  });

  console.log("→ Fetching products…");
  const { rows } = await pool.query(`
    SELECT id, COALESCE(actiune_terapeutica,'') AS actiune
      FROM product
  `);

  console.log(`→ Assigning categories for ${rows.length} products…`);
  for (let { id, actiune } of rows) {
    let cat = null;
    for (let { re, cat: c } of KEYWORD_MAP) {
      if (re.test(actiune)) { cat = c; break; }
    }
    if (!cat) cat = 'Altele';
    await pool.query(`UPDATE product SET category=$1 WHERE id=$2`, [cat, id]);
  }

  console.log("Done.");
  await pool.end();
}

main().catch(er=>{
  console.error(er);
  process.exit(1);
});

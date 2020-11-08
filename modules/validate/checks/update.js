async function update(checklist) {
  let data = checklist.report.data;

  if (checklist.checks.capiv2.duplicate.createSite === true) {
    checklist.checks.capiv2.duplicate.updateSite = false;
    return checklist;
  }

  if (
    checklist.checks.capiv2.duplicate.site.frontierID == null ||
    (checklist.checks.capiv2.duplicate.site.frontierID == undefined && data.frontierID > 0)
  ) {
    checklist.checks.capiv2.duplicate.updateSite = true;
  }

  if (
    !checklist.checks.capiv2.duplicate.site.discoveredBy.cmdrName == null ||
    checklist.checks.capiv2.duplicate.site.discoveredBy.cmdrName === 'zzz_Unknown'
  ) {
    checklist.checks.capiv2.duplicate.updateSite = true;
  }

  return checklist;
}

module.exports = update;

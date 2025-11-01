/*  Builds FormData:
 *  - appends 'logo' file if present
 *  - serialises businessData & userData as JSON strings
 */
export const assembleBusinessPayload = (businessData, userData) => {
  try {
    const fd = new FormData();

    // logo is an actual File object saved in step 0
    if (businessData?.logo instanceof File) {
      fd.append('file', businessData.logo);
    }

    // strip out the File before JSON-stringifying
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { logo, ...bizJSON } = businessData || {};
    fd.append('businessData', JSON.stringify(bizJSON));
    fd.append('userData', JSON.stringify(userData));

    return fd;
  } catch (error) {
    console.error('Error assembling business payload:', error);
    throw error;
  }
};

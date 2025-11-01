'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LoanWizard from 'sections/loan/update/LoanWizard';

export default function LoanUpdateView() {

  return (
    <>
      <LoanWizard />
    </>
  );
}
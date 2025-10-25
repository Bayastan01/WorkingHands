// src/store/ShiftStore.ts
import { makeAutoObservable, runInAction } from 'mobx';
import { Shift } from '../types';
import * as api from '../api/api';

let sample: { data: Shift[] } | null = null;
try { sample = require('../data/sample-shifts.json'); } catch (e) { sample = null; }

class ShiftStore {
  shifts: Shift[] = [];
  isLoading = false;
  error: string | null = null;

  constructor() { makeAutoObservable(this); }

  setShifts(list: Shift[]) {
    console.log('ShiftStore.setShifts count=', Array.isArray(list) ? list.length : 0);
    this.shifts = list ?? [];
  }

  clear() { this.shifts = []; this.error = null; }

  getShiftById(id: string) { return this.shifts.find(s => s.id === id) ?? null; }

  async loadByCoords(latitude: number, longitude: number, useMockIfFail = true) {
    console.log('ShiftStore.loadByCoords', latitude, longitude);
    this.isLoading = true;
    this.error = null;
    try {
      const data = await api.getShiftsByCoords(latitude, longitude);
      runInAction(() => { this.shifts = Array.isArray(data) ? data : []; this.isLoading = false; });
      console.log('ShiftStore.loadByCoords finished, items=', this.shifts.length);
    } catch (err: any) {
      console.error('ShiftStore.loadByCoords error', err);
      if (useMockIfFail && sample?.data) {
        runInAction(() => {
          this.shifts = sample!.data;
          this.isLoading = false;
          this.error = 'Using local mock data (network/API failed).';
        });
        console.log('ShiftStore: used local mock, items=', this.shifts.length);
      } else {
        runInAction(() => { this.isLoading = false; this.error = err?.message ?? 'Unknown error'; });
      }
    }
  }
}

export const shiftStore = new ShiftStore();
export default shiftStore;

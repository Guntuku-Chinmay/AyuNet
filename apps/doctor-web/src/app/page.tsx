import { Button } from '@ayunet/ui';
import { formatDate } from '@ayunet/utils';

export default function Home() {
  const today = formatDate(new Date());

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-slate-50">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-slate-200 bg-teal-50/50 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-slate-100 lg:p-4">
          Doctor Portal Workspace Base
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white lg:static lg:h-auto lg:w-auto lg:bg-none text-slate-500">
          Initialized: {today}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center text-center">
        <span className="text-teal-600 font-semibold tracking-wider uppercase text-sm mb-2">AyuNet Provider Network</span>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl mb-6">
          Doctor <span className="text-teal-600">Web Portal</span>
        </h1>
        <p className="max-w-md text-slate-500 text-lg mb-8">
          Welcome, Doctor. Access your clinic dashboard, review active patient queues, update electronic medical records (EMR), and write prescriptions.
        </p>
        <div className="flex gap-4">
          <Button variant="primary" size="lg">
            Consultations Queue
          </Button>
          <Button variant="outline" size="lg">
            Schedule Manager
          </Button>
        </div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left gap-6">
        <div className="group rounded-lg border border-slate-200 px-5 py-4 transition-colors hover:border-teal-300 hover:bg-teal-50/20 bg-white shadow-sm">
          <h2 className="mb-3 text-xl font-bold text-slate-800">
            Patient EHR{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm text-slate-500">
            Lookup patient history, medications, allergies, and diagnostic timelines.
          </p>
        </div>

        <div className="group rounded-lg border border-slate-200 px-5 py-4 transition-colors hover:border-teal-300 hover:bg-teal-50/20 bg-white shadow-sm">
          <h2 className="mb-3 text-xl font-bold text-slate-800">
            e-Prescriptions{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm text-slate-500">
            Write, sign, and route prescriptions to connected pharmacies and care channels.
          </p>
        </div>

        <div className="group rounded-lg border border-slate-200 px-5 py-4 transition-colors hover:border-teal-300 hover:bg-teal-50/20 bg-white shadow-sm">
          <h2 className="mb-3 text-xl font-bold text-slate-800">
            Lab Orders{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm text-slate-500">
            Order blood work, imaging scans, and pathology evaluations directly to partner centers.
          </p>
        </div>
      </div>
    </main>
  );
}

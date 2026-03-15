  private readonly _CURRENCY_DISCLAIMER = `Currency Conversion Notice: All platform transactions are conducted and settled in USD. If you choose to view financial information in another currency, values are converted using recent exchange rates and are provided for informational purposes only. Exchange rates fluctuate and may differ from actual settlement values. By continuing, you acknowledge that ChatNow.Zone / OmniQuest Media Inc. is not responsible for any perceived gains or losses resulting from currency fluctuations.`;

  private readonly _CANONICAL_CURRENCY = 'USD';

  get CURRENCY_DISCLAIMER(): string { return this._CURRENCY_DISCLAIMER; }
  get CANONICAL_CURRENCY(): string { return this._CANONICAL_CURRENCY; }
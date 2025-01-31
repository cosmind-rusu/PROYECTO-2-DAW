public class Transaccion
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public string Concepto { get; set; }
    public decimal Monto { get; set; }
    public string Tipo { get; set; } // Ingreso o Gasto
    public string Categoria { get; set; } // Salario, Ocio, Extra, etc.
    public DateTime Fecha { get; set; }
    public string Notas { get; set; }
}